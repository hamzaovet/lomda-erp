'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'إجمالي المبيعات', value: '١٢٤,٥٠٠ ج.م', change: '+١٢٪', icon: TrendingUp, positive: true },
    { name: 'الطلبات الجديدة', value: '٤٨', change: '+٥٪', icon: ShoppingCart, positive: true },
    { name: 'المخزون المتوفر', value: '١,٢٠٠ قطعة', change: '-٢٪', icon: Package, positive: false },
    { name: 'العملاء الجدد', value: '١٢', change: '+٢٠٪', icon: Users, positive: true },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-gray-800">أهلاً بك، مدير النظام 👋</h1>
        <p className="text-gray-500 font-bold">هذا ما يحدث في لؤلؤة العمدة اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-gray-50 text-[#D4AF37]">
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1">{stat.name}</p>
                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Placeholder Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-xl font-bold mb-6">مخطط المبيعات الأسبوعي</h3>
          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl">
             <span className="text-gray-300 font-bold italic">مخطط بياني (قيد التطوير)</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="text-xl font-bold mb-6">آخر الطلبات</h3>
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#D4AF37] font-bold">
                         #{i}
                      </div>
                      <div>
                         <p className="text-sm font-black text-gray-800 uppercase">طلب توريد</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">منذ ١٠ دقائق</p>
                      </div>
                   </div>
                   <div className="text-sm font-black text-gray-800">
                      ٢٥٠ ج.م
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
