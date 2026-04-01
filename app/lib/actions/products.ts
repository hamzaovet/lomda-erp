'use server'

import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { updateProductProductionCost } from './production';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  await connectToDatabase();
  try {
    const products = await Product.find({})
      .populate('formula.materialId', 'name')
      .sort({ name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return [];
  }
}

export async function getTradedProducts() {
  await connectToDatabase();
  try {
    const products = await Product.find({ productType: 'traded' })
      .sort({ name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("❌ Error fetching traded products:", error);
    return [];
  }
}

export async function addProduct(formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const category = formData.get('category') as string;
  const productType = (formData.get('productType') as string) || 'manufactured';
  const purchaseCost = Number(formData.get('purchaseCost')) || 0;
  const imageUrl = (formData.get('imageUrl') as string) || "";
  const packagingSize = Number(formData.get('packagingSize')) || 1;
  const baseUnitName = formData.get('baseUnitName')?.toString() || 'قطعة';
  
  console.log(`📥 Adding ${productType} Product: ${name} | SKU: ${sku}`);

  const wholesale = Number(formData.get('wholesale')) || 0;
  const retail = Number(formData.get('retail')) || 0;
  const distributor = Number(formData.get('distributor')) || 0;
  const representative = Number(formData.get('representative')) || 0;

  const packagingCost = Number(formData.get('packagingCost')) || 0;
  const overheadPercentage = Number(formData.get('overheadPercentage')) || 0;

  try {
    const existing = await Product.findOne({ sku });
    if (existing) return { success: false, error: "كود المنتج (SKU) مسجل مسبقاً" };

    const newProduct = new Product({
      name,
      sku,
      category,
      productType,
      purchaseCost: productType === 'traded' ? purchaseCost : 0,
      avgCost: productType === 'traded' ? purchaseCost : 0,
      imageUrl,
      stockQty: 0,
      packagingSize,
      baseUnitName,
      prices: {
        wholesale,
        retail,
        distributor: productType === 'manufactured' ? distributor : 0,
        representative: productType === 'manufactured' ? representative : 0,
      },
      costs: {
        packagingCost: productType === 'manufactured' ? packagingCost : 0,
        overheadPercentage: productType === 'manufactured' ? overheadPercentage : 0,
        manufacturing: 0
      },
      formula: []
    });

    await newProduct.save();
    
    if (productType === 'manufactured') {
      await updateProductProductionCost(newProduct._id.toString());
    }
    
    revalidatePath('/dashboard/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error adding product:", error);
    // Return specific validation error if possible
    return { success: false, error: error.message || "حدث خطأ أثناء إضافة المنتج" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const category = formData.get('category') as string;
  const productType = (formData.get('productType') as string) || 'manufactured';
  const purchaseCost = Number(formData.get('purchaseCost')) || 0;
  const imageUrl = (formData.get('imageUrl') as string) || "";
  const packagingSize = Number(formData.get('packagingSize')) || 1;
  const baseUnitName = formData.get('baseUnitName')?.toString() || 'قطعة';
  
  console.log(`📥 Updating ${productType} Product: ${sku} | Image: ${imageUrl}`);

  const wholesale = Number(formData.get('wholesale')) || 0;
  const retail = Number(formData.get('retail')) || 0;
  const distributor = Number(formData.get('distributor')) || 0;
  const representative = Number(formData.get('representative')) || 0;

  const packagingCost = Number(formData.get('packagingCost')) || 0;
  const overheadPercentage = Number(formData.get('overheadPercentage')) || 0;

  try {
    const updateData: any = {
      name,
      sku,
      category,
      productType,
      imageUrl,
      packagingSize,
      baseUnitName,
      'prices.wholesale': wholesale,
      'prices.retail': retail,
    };

    if (productType === 'manufactured') {
      updateData['prices.distributor'] = distributor;
      updateData['prices.representative'] = representative;
      updateData['costs.packagingCost'] = packagingCost;
      updateData['costs.overheadPercentage'] = overheadPercentage;
      updateData.purchaseCost = 0; // Manufactured cost is calculated elsewhere
    } else {
      // For traded goods: explicit reset of industrial tiers (safety)
      updateData['prices.distributor'] = 0;
      updateData['prices.representative'] = 0;
      updateData['costs.packagingCost'] = 0;
      updateData['costs.overheadPercentage'] = 0;
      updateData['costs.manufacturing'] = 0;
      updateData.formula = [];
      // If purchaseCost is provided manually during update, update it (though usually it's automated)
      if (purchaseCost > 0) updateData.purchaseCost = purchaseCost;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return { success: false, error: "المنتج غير موجود" };
    
    if (productType === 'manufactured') {
      await updateProductProductionCost(id);
    }

    revalidatePath('/dashboard/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error updating product:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء تحديث بيانات المنتج" };
  }
}

export async function deleteProduct(id: string) {
  await connectToDatabase();
  try {
    await Product.findByIdAndDelete(id);
    revalidatePath('/dashboard/products');
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المنتج" };
  }
}

export async function seedInitialProducts() {
  await connectToDatabase();
  
  const seedProducts = [
    // منظفات
    { name: "منظف أرضيات ليمون – 1 لتر", category: "منظفات", price: 30, unitsPerCarton: 12 },
    { name: "كلور أبيض – 1 لتر", category: "منظفات", price: 20, unitsPerCarton: 12 },
    { name: "منظف متعدد الاستخدامات (جنرال) – 750 مل", category: "منظفات", price: 25, unitsPerCarton: 12 },
    { name: "مسحوق غسيل أوتوماتيك (برسيل) – 2.5 كجم", category: "منظفات", price: 80, cartonPrice: 1200, unitsPerCarton: 6 },
    
    // صابون سائل
    { name: "صابون سائل لليدين (دوف) – 500 مل", category: "صابون سائل", price: 45 },
    { name: "صابون سائل اقتصادي (محلي) – 1 لتر", category: "صابون سائل", price: 25 },
    { name: "صابون سائل معقم (ديتول) – 500 مل", category: "صابون سائل", price: 65 },
  
    // صابون قطع
    { name: "صابون دوف – قطعة", category: "صابون قطع", price: 35, cartonPrice: 1600, unitsPerCarton: 48 },
    { name: "صابون نابلسي شاهين – قطعة", category: "صابون قطع", price: 10, cartonPrice: 650, unitsPerCarton: 72 },
    { name: "صابون لوكس – قطعة", category: "صابون قطع", price: 20, cartonPrice: 900, unitsPerCarton: 48 },
  
    // منتجات ورقية
    { name: "مناديل ورقية (فاين) – 200 منديل", category: "منتجات ورقية", price: 30, cartonPrice: 1100, unitsPerCarton: 40 },
    { name: "مناديل مطبخ رول (زينة) – رول", category: "منتجات ورقية", price: 25, cartonPrice: 550, unitsPerCarton: 24 },
    { name: "مناديل جيب صغيرة – عبوة", category: "منتجات ورقية", price: 5, cartonPrice: 450, unitsPerCarton: 100 },
  
    // منتجات إضافية
    { name: "سلك مواعين (كبريتة) – قطعة", category: "منتجات إضافية", price: 5, cartonPrice: 450, unitsPerCarton: 100 },
    { name: "جوانتي بلاستيك – 100 قطعة", category: "منتجات إضافية", price: 35 },
    { name: "أكياس قمامة كبيرة – 30 كيس", category: "منتجات إضافية", price: 40 }
  ];

  let addedCount = 0;
  let skippedCount = 0;

  try {
    for (let i = 0; i < seedProducts.length; i++) {
      const p = seedProducts[i];
      const existing = await Product.findOne({ name: p.name, category: p.category });
      
      if (!existing) {
        // Generate SKU: LOMDA-XXX where XXX is current count + i
        const count = await Product.countDocuments();
        const skuNumber = (count + 1).toString().padStart(3, '0');
        const sku = `LOMDA-${skuNumber}`;

        const newProduct = new Product({
          name: p.name,
          category: p.category,
          sku: sku,
          productType: 'traded',
          prices: {
            retail: p.price,
            wholesale: p.price * 0.9, // Default wholesale to 90% of retail
            distributor: p.price * 0.85,
            representative: p.price * 0.8
          },
          cartonPrice: p.cartonPrice || 0,
          unitsPerCarton: p.unitsPerCarton || 1,
          packagingSize: p.unitsPerCarton || 1, // Keep sync with existing field for core ERP logic
          imageUrl: "",
          stockQty: 0,
          costs: {
            manufacturing: 0,
            purchase: 0,
            packagingCost: 0,
            overheadPercentage: 0
          },
          formula: []
        });

        await newProduct.save();
        addedCount++;
      } else {
        skippedCount++;
      }
    }

    revalidatePath('/dashboard/products');
    revalidatePath('/');
    return { success: true, message: `✅ تمت المهمة بنجاح! تم إضافة ${addedCount} منتج وتخطي ${skippedCount} مكرر.` };
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    return { success: false, error: "حدث خطأ أثناء تهيئة المنتجات" };
  }
}
