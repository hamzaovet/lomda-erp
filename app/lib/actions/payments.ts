'use server'

import connectToDatabase from '@/lib/mongodb';
import { CustomerPayment, SupplierPayment } from '@/models/Payment';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';
import TreasuryTransaction from '@/models/TreasuryTransaction';
import { revalidatePath } from 'next/cache';

/**
 * Customer Receipt (سند قبض)
 */
export async function receiveCustomerPayment(formData: FormData) {
  await connectToDatabase();

  const customerId = formData.get('customerId') as string;
  const amount = Number(formData.get('amount'));
  const description = formData.get('description') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const date = formData.get('date') ? new Date(formData.get('date') as string) : new Date();

  try {
    // 1. Save Receipt
    const payment = new CustomerPayment({
      customer: customerId,
      amount,
      description,
      paymentMethod,
      date
    });
    await payment.save();

    // 2. Decrease Customer Debt
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { currentBalance: Number(-amount) }
    });

    // 3. Log to Treasury (Inflow)
    const treasuryRecord = new TreasuryTransaction({
      type: 'in',
      amount,
      category: 'customer_payment',
      description: `تحصيل دفعة من عميل: ${description || 'بدون وصف'}`,
      date
    });
    await treasuryRecord.save();

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard/treasury');
    return { success: true };
  } catch (error) {
    console.error("❌ Error receiving customer payment:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل سند القبض" };
  }
}

/**
 * Supplier Voucher (سند صرف)
 */
export async function makeSupplierPayment(formData: FormData) {
  await connectToDatabase();

  const supplierId = formData.get('supplierId') as string;
  const amount = Number(formData.get('amount'));
  const description = formData.get('description') as string;
  const paymentMethod = formData.get('paymentMethod') as string;
  const date = formData.get('date') ? new Date(formData.get('date') as string) : new Date();

  try {
    // 1. Save Voucher
    const payment = new SupplierPayment({
      supplier: supplierId,
      amount,
      description,
      paymentMethod,
      date
    });
    await payment.save();

    // 2. Decrease Supplier Debt
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { currentBalance: Number(-amount) }
    });

    // 3. Log to Treasury (Outflow)
    const treasuryRecord = new TreasuryTransaction({
      type: 'out',
      amount,
      category: 'supplier_payment',
      description: `سداد دفعة لمورد: ${description || 'بدون وصف'}`,
      date
    });
    await treasuryRecord.save();

    revalidatePath('/dashboard/suppliers');
    revalidatePath('/dashboard/treasury');
    return { success: true };
  } catch (error) {
    console.error("❌ Error making supplier payment:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل سند الصرف" };
  }
}

/**
 * Secure Payment Deletion (Reversal)
 */
export async function deletePayment(id: string, type: 'customer' | 'supplier', pin: string) {
  if (pin !== "2026") return { success: false, error: "رمز الأمان غير صحيح" };

  await connectToDatabase();

  try {
    if (type === 'customer') {
      const payment = await CustomerPayment.findById(id);
      if (!payment) return { success: false, error: "سند القبض غير موجود" };

      // Reverse Customer Balance (Increase debt)
      await Customer.findByIdAndUpdate(payment.customer, {
        $inc: { currentBalance: Number(payment.amount) }
      });

      // Reverse Treasury (Subtract what was added)
      const reverseTreasury = new TreasuryTransaction({
        type: 'out',
        amount: payment.amount,
        category: 'other',
        description: `عكس سند قبض ملغي: ${payment.description || id}`,
        date: new Date()
      });
      await reverseTreasury.save();

      await CustomerPayment.findByIdAndDelete(id);
      revalidatePath('/dashboard/customers');
    } else {
      const payment = await SupplierPayment.findById(id);
      if (!payment) return { success: false, error: "سند الصرف غير موجود" };

      // Reverse Supplier Balance (Increase debt)
      await Supplier.findByIdAndUpdate(payment.supplier, {
        $inc: { currentBalance: Number(payment.amount) }
      });

      // Reverse Treasury (Add back what was spent)
      const reverseTreasury = new TreasuryTransaction({
        type: 'in',
        amount: payment.amount,
        category: 'other',
        description: `عكس سند صرف ملغي: ${payment.description || id}`,
        date: new Date()
      });
      await reverseTreasury.save();

      await SupplierPayment.findByIdAndDelete(id);
      revalidatePath('/dashboard/suppliers');
    }

    revalidatePath('/dashboard/treasury');
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting payment:", error);
    return { success: false, error: "حدث خطأ أثناء حذف وعكس العملية المالية" };
  }
}
