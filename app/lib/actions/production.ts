'use server'

import connectToDatabase from '@/lib/mongodb';
import WorkOrder from '@/models/WorkOrder';
import Product from '@/models/Product';
import RawMaterial from '@/models/RawMaterial';
import { revalidatePath } from 'next/cache';

export async function getActiveProducts() {
  await connectToDatabase();
  try {
    const products = await Product.find({ productType: 'manufactured' }).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("❌ Error fetching active products:", error);
    return [];
  }
}

export async function getWorkOrders() {
  await connectToDatabase();
  try {
    const orders = await WorkOrder.find({})
      .populate('outputProduct.productId', 'name sku')
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("❌ Error fetching work orders:", error);
    return [];
  }
}

export async function createWorkOrder(data: {
  productId: string;
  qty: number;
}) {
  await connectToDatabase();

  try {
    const product = await Product.findById(data.productId).populate('formula.materialId');
    if (!product) return { success: false, error: "المنتج غير موجود" };
    if (!product.formula || product.formula.length === 0) {
      return { success: false, error: "هذا المنتج لا يحتوي على تركيبة تصنيع مسجلة" };
    }

    // 1. Calculate required materials and check availability
    const materialsUsed = [];
    for (const item of product.formula) {
      const requiredQty = item.qtyPerUnit * data.qty;
      const material = await RawMaterial.findById(item.materialId);
      
      if (!material || material.stockQty < requiredQty) {
        return { 
          success: false, 
          error: `نقص في المواد الخام: ${material?.name || 'مادة غير معروفة'}. المتوفر: ${material?.stockQty || 0}، المطلوب: ${requiredQty}` 
        };
      }

      materialsUsed.push({
        materialId: item.materialId,
        qty: requiredQty
      });
    }

    // 2. Generate Work Order Number
    const count = await WorkOrder.countDocuments();
    const orderNumber = `WO-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;

    // 3. Create the Order
    const newOrder = new WorkOrder({
      orderNumber,
      status: 'pending',
      materialsUsed,
      outputProduct: {
        productId: data.productId,
        qty: data.qty
      }
    });

    await newOrder.save();
    revalidatePath('/dashboard/manufacturing');
    return { success: true };
  } catch (error) {
    console.error("❌ Error creating work order:", error);
    return { success: false, error: "حدث خطأ أثناء بدء أمر التشغيل" };
  }
}

export async function completeWorkOrder(formData: FormData) {
  await connectToDatabase();

  const orderId = formData.get('orderId') as string;
  const actualYield = Number(formData.get('actualYield'));
  const normalSpoilage = Number(formData.get('normalSpoilage'));
  const abnormalSpoilage = Number(formData.get('abnormalSpoilage'));

  try {
    const order = await WorkOrder.findById(orderId).populate('outputProduct.productId');
    if (!order || order.status !== 'pending') {
      return { success: false, error: "فشل استرجاع أمر التشغيل أو الطلب مكتمل بالفعل" };
    }

    const product = order.outputProduct.productId; // Populated
    const targetQuantity = Number(order.outputProduct.qty);

    // 0. Strict Validation
    if (actualYield + normalSpoilage + abnormalSpoilage !== targetQuantity) {
      return { 
        success: false, 
        error: `خطأ في ميزان الكميات: الإنتاج (${actualYield}) + تالف طبيعي (${normalSpoilage}) + تالف غير طبيعي (${abnormalSpoilage}) يجب أن يساوي إجمالي الطلب (${targetQuantity})` 
      };
    }

    // 1. Calculate Total Batch Cost (CMA Style)
    let totalMaterialCost = 0;
    for (const item of order.materialsUsed) {
      const material = await RawMaterial.findById(item.materialId);
      if (material) {
        totalMaterialCost += Number(item.qty) * (Number(material.avgCost) || 0);
        // Deduct from stock
        await RawMaterial.findByIdAndUpdate(material._id, {
           $inc: { stockQty: Number(-item.qty) }
        });
      }
    }

    const pkgPerUnit = Number(product.costs?.packagingCost) || 0;
    const totalPkgCost = pkgPerUnit * targetQuantity;
    const ovhRate = (Number(product.costs?.overheadPercentage) || 0) / 100;
    
    const batchTotalBase = totalMaterialCost + totalPkgCost;
    const totalBatchCost = batchTotalBase * (1 + ovhRate);

    // 2. Cost Allocation Math
    const baseUnitCost = totalBatchCost / targetQuantity;
    const abnormalLossValue = abnormalSpoilage * baseUnitCost;
    const goodUnitsTotalCost = totalBatchCost - abnormalLossValue;
    
    // Safety check for divide by zero
    const absorbedUnitCost = actualYield > 0 ? (goodUnitsTotalCost / actualYield) : 0;

    // 3. ATOMIC UPDATES (Inventory -> Cost -> Order)
    
    // Update Product Stock and Cost
    await Product.findByIdAndUpdate(product._id, {
      $inc: { stockQty: Number(actualYield) },
      $set: { 'costs.manufacturing': Number(absorbedUnitCost) }
    });

    // Update WorkOrder status and metrics
    await WorkOrder.findByIdAndUpdate(orderId, {
      $set: {
        status: 'completed',
        actualYield: Number(actualYield),
        normalSpoilage: Number(normalSpoilage),
        abnormalSpoilage: Number(abnormalSpoilage),
        abnormalLossValue: Number(abnormalLossValue)
      }
    });

    revalidatePath('/dashboard/manufacturing');
    revalidatePath('/dashboard/products');
    
    return { 
      success: true, 
      data: {
        absorbedUnitCost,
        abnormalLossValue
      }
    };
  } catch (error: any) {
    console.error("❌ Error completing work order:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء إتمام عملية التصنيع" };
  }
}

export async function updateProductFormula(productId: string, ingredients: { materialId: string; qtyPerUnit: number }[]) {
  await connectToDatabase();

  try {
    const product = await Product.findById(productId);
    if (!product) return { success: false, error: "المنتج غير موجود" };

    // Update the formula
    product.formula = ingredients.map(ing => ({
      materialId: ing.materialId,
      qtyPerUnit: ing.qtyPerUnit
    }));

    await product.save();
    revalidatePath('/dashboard/products');
    revalidatePath('/dashboard/manufacturing'); // Manufacturing needs to see new formulas for WOs
    
    // Trigger Cost Update
    await updateProductProductionCost(productId);

    return { success: true };
  } catch (error) {
    console.error("❌ Error updating product formula:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث التركيبة" };
  }
}

export async function updateProductProductionCost(productId: string) {
  await connectToDatabase();

  try {
    // Fresh fetch to ensure we have the newest industrial variables (packaging/overhead)
    const product = await Product.findById(productId);
    if (!product) return { success: false, error: "المنتج غير موجود" };

    const pkg = Number(product.costs?.packagingCost) || 0;
    const ovh = Number(product.costs?.overheadPercentage) || 0;
    
    console.log(`🛠️ Recalculating Production Cost for: ${product.name} (${productId})`);
    console.log(`👉 Ind. Params: Packaging=${pkg}, Overhead=${ovh}%`);

    let baseMaterialCost = 0;
    
    // 1. Calculate Base Material Cost from Formula
    if (product.formula && product.formula.length > 0) {
      for (const item of product.formula) {
        const material = await RawMaterial.findById(item.materialId);
        if (material && material.avgCost) {
          baseMaterialCost += item.qtyPerUnit * material.avgCost;
        }
      }
    }

    // 2. Apply Industrial Formula: (Material + Packaging) * (1 + Overhead%)
    const trueManufacturingCost = (baseMaterialCost + pkg) * (1 + (ovh / 100));
    
    console.log(`✅ Final Industrial Cost: ${trueManufacturingCost}`);

    // 3. Persist the final calculated cost using findByIdAndUpdate for safety
    await Product.findByIdAndUpdate(productId, { 
      'costs.manufacturing': trueManufacturingCost 
    });
    
    revalidatePath('/dashboard/products');
    return { success: true, cost: trueManufacturingCost };
  } catch (error) {
    console.error("❌ Error calculating production cost:", error);
    return { success: false, error: "حدث خطأ أثناء حساب التكلفة" };
  }
}
