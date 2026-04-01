'use server'

import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import TreasuryTransaction from '@/models/TreasuryTransaction';
import { revalidatePath } from 'next/cache';

/**
 * Treasury: Opening Balance / Manual Deposit / Manual Withdraw
 */
export async function addManualTransaction(formData: FormData) {
  await connectToDatabase();
  
  const type = formData.get('type') as 'in' | 'out';
  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string || 'other';
  const description = formData.get('description') as string;

  try {
    const transaction = new TreasuryTransaction({
      type,
      amount,
      category,
      description,
      date: new Date()
    });

    await transaction.save();
    revalidatePath('/dashboard/treasury');
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding manual transaction:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل العملية المالية" };
  }
}

/**
 * Expense Management: Atomic Save to Expense + Treasury
 */
export async function addExpense(formData: FormData) {
  await connectToDatabase();

  const amount = Number(formData.get('amount'));
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;

  try {
    // 1. Save to Expense Collection
    const newExpense = new Expense({
      amount,
      category,
      description,
      date: new Date()
    });
    await newExpense.save();

    // 2. Reflect in Treasury (OUT)
    const treasuryRecord = new TreasuryTransaction({
      type: 'out',
      amount,
      category: 'expense',
      description: `مصروف: ${category} - ${description}`,
      date: new Date()
    });
    await treasuryRecord.save();

    revalidatePath('/dashboard/treasury');
    return { success: true };
  } catch (error) {
    console.error("❌ Error adding expense:", error);
    return { success: false, error: "حدث خطأ أثناء تسجيل المصروف" };
  }
}

/**
 * Data Aggregators for UI
 */
export async function getTreasuryBalance() {
  await connectToDatabase();
  try {
    const aggregate = await TreasuryTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalIn: {
            $sum: { $cond: [{ $eq: ['$type', 'in'] }, '$amount', 0] }
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ['$type', 'out'] }, '$amount', 0] }
          }
        }
      }
    ]);

    if (aggregate.length === 0) return 0;
    return (aggregate[0].totalIn || 0) - (aggregate[0].totalOut || 0);
  } catch (error) {
    console.error("❌ Error calculating balance:", error);
    return 0;
  }
}

export async function getTreasuryTransactions() {
  await connectToDatabase();
  try {
    const transactions = await TreasuryTransaction.find({})
      .sort({ date: -1 })
      .lean();
    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    console.error("❌ Error fetching treasury logs:", error);
    return [];
  }
}

export async function getExpenses() {
  await connectToDatabase();
  try {
    const expenses = await Expense.find({})
      .sort({ date: -1 })
      .lean();
    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    console.error("❌ Error fetching expenses:", error);
    return [];
  }
}
