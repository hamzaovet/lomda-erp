'use server'

import connectToDatabase from '@/lib/mongodb';
import Supplier from '@/models/Supplier';
import { revalidatePath } from 'next/cache';

export async function getSuppliers() {
  await connectToDatabase();
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(suppliers));
  } catch (error) {
    console.error("❌ Error fetching suppliers:", error);
    return [];
  }
}

export async function addSupplier(formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const category = formData.get('category') as string; // 'Raw' or 'Finished'
  const initialBalance = parseFloat(formData.get('initialBalance') as string || '0');

  try {
    const newSupplier = new Supplier({
      name,
      phone,
      category,
      currentBalance: initialBalance,
    });

    await newSupplier.save();
    revalidatePath('/dashboard/suppliers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding supplier:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المورد" };
  }
}

export async function updateSupplier(id: string, formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const category = formData.get('category') as string;
  const currentBalance = parseFloat(formData.get('currentBalance') as string || '0');

  try {
    const updateData = {
      name,
      phone,
      category,
      currentBalance,
    };

    const updated = await Supplier.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return { success: false, error: "المورد غير موجود" };

    revalidatePath('/dashboard/suppliers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating supplier:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث بيانات المورد" };
  }
}

export async function deleteSupplier(id: string) {
  await connectToDatabase();
  try {
    await Supplier.findByIdAndDelete(id);
    revalidatePath('/dashboard/suppliers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting supplier:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المورد" };
  }
}
