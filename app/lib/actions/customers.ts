'use server'

import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { revalidatePath } from 'next/cache';

export async function getCustomers() {
  await connectToDatabase();
  try {
    const customers = await Customer.find({}).sort({ name: 1 }).lean();
    return JSON.parse(JSON.stringify(customers));
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return [];
  }
}

export async function addCustomer(formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const pricingTier = formData.get('pricingTier') as string;
  const customerType = formData.get('customerType') as string;
  const currentBalance = Number(formData.get('currentBalance')) || 0;

  try {
    const newCustomer = new Customer({
      name,
      phone,
      address,
      pricingTier,
      customerType,
      currentBalance
    });

    await newCustomer.save();
    revalidatePath('/dashboard/customers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding customer:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة العميل" };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  await connectToDatabase();
  
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;
  const pricingTier = formData.get('pricingTier') as string;
  const customerType = formData.get('customerType') as string;
  const currentBalance = Number(formData.get('currentBalance')) || 0;

  try {
    const updateData = {
      name,
      phone,
      address,
      pricingTier,
      customerType,
      'currentBalance': currentBalance, // Explicit key string to match previous pattern
    };

    // Strict findByIdAndUpdate with $set dot-notation for nested/numeric fields
    const updated = await Customer.findByIdAndUpdate(
      id, 
      { $set: updateData },
      { new: true }
    );

    if (!updated) return { success: false, error: "العميل غير موجود" };

    revalidatePath('/dashboard/customers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث بيانات العميل" };
  }
}

export async function deleteCustomer(id: string) {
  await connectToDatabase();
  try {
    await Customer.findByIdAndDelete(id);
    revalidatePath('/dashboard/customers');
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    return { success: false, error: "حدث خطأ أثناء حذف العميل" };
  }
}
