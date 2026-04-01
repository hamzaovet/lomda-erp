'use server'

import connectToDatabase from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import TreasuryTransaction from '@/models/TreasuryTransaction';
import { revalidatePath } from 'next/cache';

export async function getSalesInvoices() {
  await connectToDatabase();
  try {
    const invoices = await SalesInvoice.find({})
      .populate('customer', 'name phone pricingTier')
      .sort({ date: -1 })
      .lean();
    return JSON.parse(JSON.stringify(invoices));
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return [];
  }
}

export async function createSalesInvoice(invoiceData: any) {
  await connectToDatabase();

  const {
    customerId,
    items, // [{ productId, qtyCartons, qtyPieces, unitPrice }]
    amountPaid,
    paymentMethod,
    date
  } = invoiceData;

  try {
    // 1. Validate Stock & Calculate Totals
    let totalAmount = 0;
    let totalManufacturingCost = 0;
    const itemsToSave = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`المنتج غير موجود: ${item.productId}`);

      const totalPiecesSold = (item.qtyCartons * product.packagingSize) + item.qtyPieces;
      
      // Check stock
      if (product.stockQty < totalPiecesSold) {
        throw new Error(`عجز في مخزن المنتج: ${product.name}. الكمية المتاحة: ${product.stockQty} قطعة.`);
      }

      const lineTotal = totalPiecesSold * item.unitPrice;
      totalAmount += lineTotal;
      totalManufacturingCost += (product.costs.manufacturing * totalPiecesSold);

      itemsToSave.push({
        product: product._id,
        qtyCartons: item.qtyCartons,
        qtyPieces: item.qtyPieces,
        unitPrice: item.unitPrice,
        lineTotal
      });

      // 2. Deduct Stock
      await Product.findByIdAndUpdate(product._id, { 
        $inc: { stockQty: Number(-totalPiecesSold) } 
      });
    }

    // 3. Update Customer Balance (Increase debt)
    const netDebt = totalAmount - amountPaid;
    if (netDebt !== 0) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { currentBalance: Number(netDebt) }
      });
    }

    // 4. Generate Invoice Number (e.g., INV-20231027-001)
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await SalesInvoice.countDocuments({ 
        date: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });
    const invoiceNumber = `INV-${today}-${(count + 1).toString().padStart(3, '0')}`;

    // 5. Save Sales Invoice
    const newInvoice = new SalesInvoice({
      invoiceNumber,
      customer: customerId,
      date: date || new Date(),
      items: itemsToSave,
      totalAmount,
      amountPaid,
      paymentMethod,
      totalManufacturingCost
    });

    await newInvoice.save();

    // 🚀 Treasury Integration: Log Sales Revenue
    if (amountPaid > 0) {
      await new TreasuryTransaction({
        type: 'in',
        amount: Number(amountPaid),
        category: 'sales_revenue',
        description: `تحصيل نقدي - فاتورة مبيعات رقم ${invoiceNumber}`,
        date: date || new Date()
      }).save();
    }

    revalidatePath('/dashboard/sales');
    revalidatePath('/dashboard/treasury'); // Update Treasury dashboard
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/customers');
    
    return { success: true, invoice: JSON.parse(JSON.stringify(newInvoice)) };
  } catch (error: any) {
    console.error("❌ Error creating sales invoice:", error);
    return { success: false, error: error.message || "حدث خطأ غير متوقع أثناء إصدار الفاتورة" };
  }
}

export async function deleteSalesInvoice(id: string) {
  await connectToDatabase();
  
  try {
    const invoice = await SalesInvoice.findById(id).populate('items.product');
    if (!invoice) return { success: false, error: "الفاتورة غير موجودة" };

      // 1. Reverse Stock Effects
    for (const item of invoice.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const totalPiecesToRestore = (Number(item.qtyCartons) * Number(product.packagingSize)) + Number(item.qtyPieces);
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stockQty: Number(totalPiecesToRestore) }
        });
      }
    }

    // 2. Reverse Customer Balance Effects
    const netDebt = Number(invoice.totalAmount) - Number(invoice.amountPaid);
    if (netDebt !== 0) {
      await Customer.findByIdAndUpdate(invoice.customer, {
        $inc: { currentBalance: Number(-netDebt) }
      });
    }

    // 3. Delete the Invoice
    await SalesInvoice.findByIdAndDelete(id);

    revalidatePath('/dashboard/sales');
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/customers');

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error deleting sales invoice:", error);
    return { success: false, error: "حدث خطأ أثناء حذف وعكس حركة الفاتورة" };
  }
}

export async function createSalesReturn(returnData: any) {
  await connectToDatabase();

  const {
    customerId,
    items, // [{ productId, qtyCartons, qtyPieces, unitPrice }]
    amountRefunded, // Cash returned to customer
    paymentMethod,
    date
  } = returnData;

  try {
    let totalAmount = 0;
    let totalManufacturingCost = 0;
    const itemsToSave = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`المنتج غير موجود: ${item.productId}`);

      const totalPiecesReturned = (item.qtyCartons * product.packagingSize) + item.qtyPieces;
      
      const lineTotal = totalPiecesReturned * item.unitPrice;
      totalAmount += lineTotal;
      totalManufacturingCost += (product.costs.manufacturing * totalPiecesReturned);

      itemsToSave.push({
        product: product._id,
        qtyCartons: item.qtyCartons,
        qtyPieces: item.qtyPieces,
        unitPrice: item.unitPrice,
        lineTotal
      });

      // 1. INCREASE STOCK (Returning to warehouse)
      await Product.findByIdAndUpdate(product._id, { 
        $inc: { stockQty: Number(totalPiecesReturned) } 
      });
    }

    // 2. Update Customer Balance (Decrease debt by total value - what was already refunded in cash)
    // If the return value is 1000 and we gave them 200 cash, their remaining debt decreases by 800.
    const netCreditToCustomer = Number(totalAmount) - Number(amountRefunded);
    if (netCreditToCustomer !== 0) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { currentBalance: Number(-netCreditToCustomer) }
      });
    }

    // 3. Generate Return Number
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = await SalesInvoice.countDocuments({ 
        invoiceType: 'return',
        date: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    });
    const invoiceNumber = `RET-S-${today}-${(count + 1).toString().padStart(3, '0')}`;

    // 4. Save Return Document
    const newReturn = new SalesInvoice({
      invoiceNumber,
      customer: customerId,
      date: date || new Date(),
      items: itemsToSave,
      totalAmount,
      amountPaid: amountRefunded, // In returns, amountPaid tracks the refund
      paymentMethod,
      totalManufacturingCost,
      invoiceType: 'return'
    });

    await newReturn.save();

    // 🚀 Treasury Integration: Log Sales Refund (OUT)
    if (amountRefunded > 0) {
      await new TreasuryTransaction({
        type: 'out',
        amount: Number(amountRefunded),
        category: 'sales_revenue',
        description: `مرتجع مبيعات نقدي - رقم ${invoiceNumber}`,
        date: date || new Date()
      }).save();
    }

    revalidatePath('/dashboard/sales');
    revalidatePath('/dashboard/treasury'); // Update Treasury dashboard
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/customers');
    
    return { success: true, invoice: JSON.parse(JSON.stringify(newReturn)) };
  } catch (error: any) {
    console.error("❌ Error creating sales return:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء معالجة المرتجع" };
  }
}
