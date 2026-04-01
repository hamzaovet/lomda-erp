'use server'

import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import RawMaterial from '@/models/RawMaterial';
import Customer from '@/models/Customer';
import Supplier from '@/models/Supplier';
import WorkOrder from '@/models/WorkOrder';
import Transaction from '@/models/Transaction';

/**
 * Aggregates core statistics for the ERP Dashboard overview.
 */
export async function getDashboardStats() {
  await connectToDatabase();

  try {
    const [
      totalProducts,
      totalRawMaterials,
      totalCustomers,
      totalSuppliers,
      activeWorkOrders,
      totalSales
    ] = await Promise.all([
      Product.countDocuments(),
      RawMaterial.countDocuments(),
      Customer.countDocuments(),
      Supplier.countDocuments(),
      WorkOrder.countDocuments({ status: 'pending' }),
      Transaction.aggregate([
        { $match: { type: 'Sale' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return {
      productsCount: totalProducts,
      rawMaterialsCount: totalRawMaterials,
      customersCount: totalCustomers,
      suppliersCount: totalSuppliers,
      activeWorkOrdersCount: activeWorkOrders,
      totalSalesAmount: totalSales[0]?.total || 0,
    };
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return {
      productsCount: 0,
      rawMaterialsCount: 0,
      customersCount: 0,
      suppliersCount: 0,
      activeWorkOrdersCount: 0,
      totalSalesAmount: 0,
    };
  }
}
