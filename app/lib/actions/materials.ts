'use server'

import connectToDatabase from '@/lib/mongodb';
import RawMaterial from '@/models/RawMaterial';
import { revalidatePath } from 'next/cache';

export async function addRawMaterial(formData: FormData) {
  await connectToDatabase();

  const name = formData.get('name') as string;
  const code = formData.get('code') as string;
  const unit = formData.get('unit') as string;
  const minLevel = parseFloat(formData.get('minLevel') as string || '0');

  try {
    const existingMaterial = await RawMaterial.findOne({ code });
    if (existingMaterial) {
      return { success: false, error: "كود الخامة مسجل مسبقاً" };
    }

    const newMaterial = new RawMaterial({
      name,
      code,
      unit,
      minLevel,
      stockQty: 0,
      avgCost: 0
    });

    await newMaterial.save();
    revalidatePath('/dashboard/manufacturing');
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding raw material:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل الخامة" };
  }
}
