'use server'

import mongoose from 'mongoose';
import PurchaseInvoice from '@/models/PurchaseInvoice';
import RawMaterial from '@/models/RawMaterial';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import Transaction from '@/models/Transaction';
import TreasuryTransaction from '@/models/TreasuryTransaction';
import connectToDatabase from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';
import { updateProductProductionCost } from './production';

export async function getRawMaterials() {
  await connectToDatabase();
  try {
    const materials = await RawMaterial.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(materials));
  } catch (error) {
    console.error("❌ Error fetching raw materials:", error);
    return [];
  }
}

export async function addPurchaseInvoice(data: {
  supplierId: string;
  items: { itemId: string; qty: number; price: number; itemType: 'RawMaterial' | 'Product' }[];
  amountPaid: number;
  paymentMethod: 'Cash' | 'Check' | 'Transfer' | 'Credit';
  dueDate?: string;
}) {
  await connectToDatabase();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let totalAmount = 0;
    const descriptions = [];
    const itemsToSave = [];

    // 1. Process each item (Update Stock & Avg Cost)
    for (const item of data.items) {
      const type = item.itemType; // 'RawMaterial' or 'Product'
      let itemDoc;
      
      if (type === 'RawMaterial') {
        itemDoc = await RawMaterial.findById(item.itemId).session(session);
      } else {
        itemDoc = await Product.findById(item.itemId).session(session);
      }

      if (!itemDoc) throw new Error(`الصنف غير موجود: ${item.itemId}`);

      const subtotal = Number(item.qty) * Number(item.price);
      totalAmount += subtotal;
      descriptions.push(`${itemDoc.name} (${item.qty} ${type === 'RawMaterial' ? itemDoc.unit : (itemDoc.baseUnitName || 'قطعة')})`);

      itemsToSave.push({
        itemId: itemDoc._id,
        onModel: type,
        qty: Number(item.qty),
        price: Number(item.price),
        lineTotal: subtotal
      });

      // Calculate Moving Average Cost (متوسط التكلفة المتحرك)
      const currentStock = Number(itemDoc.stockQty) || 0;
      const currentAvgCost = Number(itemDoc.avgCost) || (type === 'Product' ? (itemDoc.purchaseCost || 0) : 0);
      const totalNewStock = currentStock + Number(item.qty);
      
      const newAvgCost = totalNewStock > 0 
        ? ((currentStock * currentAvgCost) + (Number(item.qty) * Number(item.price))) / totalNewStock
        : Number(item.price);

      if (type === 'RawMaterial') {
        await RawMaterial.findByIdAndUpdate(itemDoc._id, {
          $set: { 
            stockQty: Number(totalNewStock),
            avgCost: Number(newAvgCost)
          }
        }).session(session);

        // Recursive Cost Update for Products using this Raw Material
        const productsUsingMaterial = await Product.find({ 'formula.materialId': item.itemId }).session(session);
        for (const product of productsUsingMaterial) {
          await updateProductProductionCost(product._id.toString());
        }
      } else {
        await Product.findByIdAndUpdate(itemDoc._id, {
          $set: { 
            stockQty: Number(totalNewStock),
            avgCost: Number(newAvgCost),
            purchaseCost: Number(newAvgCost) // Sync with purchaseCost for storefront/backward compat
          }
        }).session(session);
      }
    }

    const remainingBalance = Number(totalAmount) - Number(data.amountPaid);

    // 2. Generate Invoice Number
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await PurchaseInvoice.countDocuments({ 
        invoiceType: 'invoice',
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    }).session(session);
    const invoiceNumber = `PUR-${today}-${(count + 1).toString().padStart(3, '0')}`;

    // 3. Save Purchase Invoice
    const newInvoice = new PurchaseInvoice({
      invoiceNumber,
      supplier: data.supplierId,
      items: itemsToSave,
      totalAmount,
      amountPaid: data.amountPaid,
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      invoiceType: 'invoice'
    });
    await newInvoice.save({ session });

    // 4. Log Transaction Data
    const transaction = new Transaction({
      type: 'Purchase',
      amount: totalAmount,
      amountPaid: data.amountPaid,
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      partyId: data.supplierId,
      partyModel: 'Supplier',
      description: `فاتورة مشتريات رقم ${invoiceNumber}: ${descriptions.join('، ')}`,
      date: new Date(),
    });
    await transaction.save({ session });

    // 5. Update Supplier Balance
    await Supplier.findByIdAndUpdate(data.supplierId, {
      $inc: { currentBalance: Number(remainingBalance) }
    }).session(session);

    // 6. Treasury Integration
    if (data.amountPaid > 0) {
      await new TreasuryTransaction({
        type: 'out',
        amount: Number(data.amountPaid),
        category: 'purchase_payment',
        description: `دفع نقدي - فاتورة مشتريات رقم ${invoiceNumber}`,
        date: new Date()
      }).save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    revalidatePath('/dashboard/manufacturing');
    revalidatePath('/dashboard/purchases');
    revalidatePath('/dashboard/treasury');
    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/products');
    revalidatePath('/');
    
    return { success: true, invoice: JSON.parse(JSON.stringify(newInvoice)) };
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Error processing purchase invoice:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء معالجة الفاتورة" };
  }
}

export async function getPurchaseInvoices() {
  await connectToDatabase();
  try {
    const invoices = await PurchaseInvoice.find({})
      .populate('supplier', 'name category currentBalance')
      .populate({
        path: 'items.itemId',
        select: 'name code unit baseUnitName sku'
      })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(invoices));
  } catch (error) {
    console.error("❌ Error fetching purchase invoices:", error);
    return [];
  }
}

export async function createPurchaseReturn(returnData: any) {
  await connectToDatabase();

  const {
    supplierId,
    items, // [{ itemId, qty, price, itemType }]
    amountRefunded, 
    paymentMethod,
    date
  } = returnData;

  try {
    let totalAmount = 0;
    const itemsToSave = [];
    const descriptions = [];

    for (const item of items) {
      const type = item.itemType || 'RawMaterial';
      const model = type === 'RawMaterial' ? RawMaterial : Product;
      
      const itemDoc = await model.findById(item.itemId);
      if (!itemDoc) throw new Error(`الصنف غير موجود: ${item.itemId}`);

      // 1. VALIDATE STOCK
      if (itemDoc.stockQty < item.qty) {
        throw new Error(`عجز في المخزن: ${itemDoc.name}. المتبقي: ${itemDoc.stockQty}.`);
      }

      const lineTotal = item.qty * item.price;
      totalAmount += lineTotal;
      descriptions.push(`${itemDoc.name} (${item.qty})`);

      itemsToSave.push({
        itemId: itemDoc._id,
        onModel: type,
        qty: item.qty,
        price: item.price,
        lineTotal
      });

      // 2. DECREASE STOCK
      await model.findByIdAndUpdate(itemDoc._id, { 
        $inc: { stockQty: Number(-item.qty) } 
      });
    }

    const netCreditToUs = Number(totalAmount) - Number(amountRefunded);
    if (netCreditToUs !== 0) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { currentBalance: Number(-netCreditToUs) }
      });
    }

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await PurchaseInvoice.countDocuments({ invoiceType: 'return' });
    const invoiceNumber = `RET-P-${today}-${(count + 1).toString().padStart(3, '0')}`;

    const newReturn = new PurchaseInvoice({
      invoiceNumber,
      supplier: supplierId,
      date: date || new Date(),
      items: itemsToSave,
      totalAmount,
      amountPaid: amountRefunded, 
      paymentMethod,
      invoiceType: 'return'
    });
    await newReturn.save();

    revalidatePath('/dashboard/purchases');
    revalidatePath('/dashboard/treasury');
    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/products');
    
    return { success: true, invoice: JSON.parse(JSON.stringify(newReturn)) };
  } catch (error: any) {
    console.error("❌ Error creating purchase return:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء معالجة المرتجع" };
  }
}

export async function getRawMaterialValue() {
  await connectToDatabase();
  try {
    const result = await RawMaterial.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ["$stockQty", "$avgCost"] } } } }
    ]);
    return result[0]?.total || 0;
  } catch (error) {
    console.error("❌ Error calculating raw material value:", error);
    return 0;
  }
}
