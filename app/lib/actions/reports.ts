'use server'

import connectToDatabase from '@/lib/mongodb';
import SalesInvoice from '@/models/SalesInvoice';
import Expense from '@/models/Expense';
import WorkOrder from '@/models/WorkOrder';
import Product from '@/models/Product';
import RawMaterial from '@/models/RawMaterial';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';
import TreasuryTransaction from '@/models/TreasuryTransaction';

/**
 * Master aggregation for the C-Suite Financial Dashboard.
 * All Stats are lifetime (All Time).
 */
export async function getDashboardStats() {
  await connectToDatabase();

  try {
    // 1. Net Sales & COGS (Factoring Invoices vs Returns)
    const salesData = await SalesInvoice.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$invoiceType", "invoice"] }, "$totalAmount", 0] }
          },
          totalReturns: {
            $sum: { $cond: [{ $eq: ["$invoiceType", "return"] }, "$totalAmount", 0] }
          },
          costInvoices: {
            $sum: { $cond: [{ $eq: ["$invoiceType", "invoice"] }, "$totalManufacturingCost", 0] }
          },
          costReturns: {
            $sum: { $cond: [{ $eq: ["$invoiceType", "return"] }, "$totalManufacturingCost", 0] }
          }
        }
      }
    ]);

    const netSales = (salesData[0]?.totalRevenue || 0) - (salesData[0]?.totalReturns || 0);
    const cogs = (salesData[0]?.costInvoices || 0) - (salesData[0]?.costReturns || 0);

    // 2. Expenses
    const expenseData = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = expenseData[0]?.total || 0;

    // 3. Spoilage Losses
    const spoilageData = await WorkOrder.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$abnormalLossValue" } } }
    ]);
    const totalAbnormalLoss = spoilageData[0]?.total || 0;

    // 4. Inventory Valuation
    const [rawMatValue, prodValue] = await Promise.all([
      RawMaterial.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ["$stockQty", "$avgCost"] } } } }
      ]),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ["$stockQty", "$costs.manufacturing"] } } } }
      ])
    ]);
    const rawTotal = (rawMatValue[0]?.total || 0);
    const prodTotal = (prodValue[0]?.total || 0);
    const inventoryValuation = {
      total: rawTotal + prodTotal,
      rawMaterials: rawTotal,
      finishedGoods: prodTotal
    };

    // 5. Treasury Balance (Ledger History)
    const treasuryBalanceData = await TreasuryTransaction.aggregate([
      {
        $group: {
          _id: null,
          totalIn: { $sum: { $cond: [{ $eq: ["$type", "in"] }, "$amount", 0] } },
          totalOut: { $sum: { $cond: [{ $eq: ["$type", "out"] }, "$amount", 0] } }
        }
      }
    ]);
    const treasuryBalance = (treasuryBalanceData[0]?.totalIn || 0) - (treasuryBalanceData[0]?.totalOut || 0);

    // 6. Top Debtors & Creditors
    const [topDebtors, topCreditors] = await Promise.all([
      Customer.find({ currentBalance: { $gt: 0 } }).sort({ currentBalance: -1 }).limit(3).lean(),
      Supplier.find({ currentBalance: { $gt: 0 } }).sort({ currentBalance: -1 }).limit(3).lean()
    ]);

    // 7. Calculate Net Profit
    const netProfit = netSales - cogs - totalExpenses - totalAbnormalLoss;

    return {
      success: true,
      data: {
        netSales,
        cogs,
        totalExpenses,
        totalAbnormalLoss,
        inventoryValuation,
        treasuryBalance,
        netProfit,
        topDebtors: JSON.parse(JSON.stringify(topDebtors)),
        topCreditors: JSON.parse(JSON.stringify(topCreditors)),
        grossProfit: netSales - cogs
      }
    };
  } catch (error) {
    console.error("❌ Error generating financial reports:", error);
    return { success: false, error: "فشل في إنشاء التقارير المالية" };
  }
}
