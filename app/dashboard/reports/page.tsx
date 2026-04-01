'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Wallet, 
  Package, 
  Users, 
  Building2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Loader2,
  Calculator,
  ChevronDown,
  Dot
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDashboardStats } from '@/app/lib/actions/reports'

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      const result = await getDashboardStats()
      if (result.success) {
        setStats(result.data)
      } else {
        console.error(result.error)
      }
      setIsLoading(false)
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
        <p className="text-gray-400 font-bold italic">جاري تجميع التقارير المالية وتحليل البيانات...</p>
      </div>
    )
  }

  if (!stats) return null

  // Helper for currency formatting
  const fmt = (val: number) => (val || 0).toLocaleString('ar-EG', { numberingSystem: 'latn' });

  // Ratio for Sales vs Expenses Chart
  const salesVal = stats.netSales || 1 // Avoid divide by zero
  const expenseRatio = Math.min(100, (stats.totalExpenses / salesVal) * 100);
  const profitRatio = Math.max(0, 100 - expenseRatio);

  return (
    <div className="flex flex-col gap-10 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] mb-2">
            <BarChart3 size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Intelligence & Reports</span>
          </div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">التقارير التحليلية والمالية</h1>
          <p className="text-gray-500 font-bold italic mt-1 flex items-center gap-2">
             إجمالي الإحصائيات حتى تاريخه - 
             <span className="text-[#D4AF37]">{new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' })}</span>
          </p>
        </div>
        
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase">الحالة المالية للمنشأة</span>
              <span className={`text-lg font-black ${stats.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                 {stats.netProfit >= 0 ? 'أداء إيجابي (Profit)' : 'أداء بحاجة للمراجعة (Loss)'}
              </span>
           </div>
           <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stats.netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
              {stats.netProfit >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
           </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "صافي المبيعات", value: stats.netSales, icon: ArrowUpRight, color: "text-blue-600", bg: "bg-blue-50", desc: "إجمالي الفواتير المعتمدة" },
          { label: "صافي الربح الحقيقي", value: stats.netProfit, icon: Calculator, color: stats.netProfit >= 0 ? "text-emerald-600" : "text-red-500", bg: stats.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50", desc: "بعد خصم التكاليف والمصروفات" },
          { label: "رصيد الخزينة الموحد", value: stats.treasuryBalance, icon: Wallet, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5", desc: "كامل السيولة النقدية المتوفرة" },
          { 
            label: "قيمة المخزون الكلي", 
            value: stats.inventoryValuation?.total || 0, 
            icon: Package, 
            color: "text-[#1D1D1F]", 
            bg: "bg-gray-100", 
            desc: `خامات: ${stats.inventoryValuation?.rawMaterials?.toLocaleString('ar-EG', { numberingSystem: 'latn' }) || '0'} | منتجات: ${stats.inventoryValuation?.finishedGoods?.toLocaleString('ar-EG', { numberingSystem: 'latn' }) || '0'}`,
            showCustomDesc: true 
          }
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-1.5 w-full bg-gray-50 group-hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100" />
            <div className="flex items-center justify-between mb-6">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={28} />
              </div>
              <div className="text-gray-200">
                <Dot size={24} />
              </div>
            </div>
            <div>
              <p className="text-gray-400 font-bold text-xs mb-2 uppercase tracking-wide">{kpi.label}</p>
              <h2 suppressHydrationWarning className={`text-3xl font-black tracking-tighter ${kpi.color}`}>
                 {fmt(kpi.value)}
                 <span className="text-xs mr-2 opacity-50">ج.م</span>
              </h2>
              <p className={`text-[10px] ${kpi.showCustomDesc ? 'text-emerald-600 font-black' : 'text-gray-300 font-bold'} mt-2 flex items-center gap-1 italic`}>
                 <Info size={10} />
                 {kpi.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Reporting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Income Statement (P&L) */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <Calculator className="text-emerald-600" />
                    قائمة الدخل المبسطة
                 </h2>
                 <span className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">Income Statement View</span>
              </div>

              <div className="space-y-6">
                 {/* Revenue */}
                 <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <TrendingUp size={20} />
                       </div>
                       <span className="font-bold text-gray-600">صافي إيرادات المبيعات</span>
                    </div>
                    <span suppressHydrationWarning className="text-xl font-black text-gray-800">{fmt(stats.netSales)}</span>
                 </div>

                 {/* COGS (Negative) */}
                 <div className="flex items-center justify-between bg-red-50/20 p-4 rounded-2xl border border-dashed border-red-100">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                          <TrendingDown size={20} />
                       </div>
                       <span className="font-bold text-gray-600">تكلفة البضاعة المباعة (COGS)</span>
                    </div>
                    <span suppressHydrationWarning className="text-xl font-black text-red-600">({fmt(stats.cogs)})</span>
                 </div>

                 {/* Gross Profit Divider */}
                 <div className="h-px bg-gray-100 my-2" />
                 <div className="flex items-center justify-between pr-14">
                    <span className="text-xs font-black text-emerald-600 uppercase italic tracking-widest">إجمالي الربح التشغيلي</span>
                    <span suppressHydrationWarning className="text-2xl font-black text-emerald-600 tracking-tighter">{fmt(stats.grossProfit)}</span>
                 </div>

                 {/* Expenses */}
                 <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                          <ArrowDownRight size={20} />
                       </div>
                       <span className="font-bold text-gray-600">إجمالي المصروفات التشغيلية</span>
                    </div>
                    <span suppressHydrationWarning className="text-xl font-black text-gray-800">({fmt(stats.totalExpenses)})</span>
                 </div>

                 {/* Spoilage Loss */}
                 <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                          <TrendingDown size={20} />
                       </div>
                       <span className="font-bold text-gray-600">خسائر التالف (Abnormal Spoilage)</span>
                    </div>
                    <span suppressHydrationWarning className="text-xl font-black text-red-600">({fmt(stats.totalAbnormalLoss)})</span>
                 </div>

                 {/* Final Net Profit */}
                 <div className="pt-8 mt-8 border-t-2 border-gray-100">
                    <div className="bg-[#1D1D1F] text-[#D4AF37] px-8 py-6 rounded-[2rem] flex items-center justify-between shadow-xl shadow-black/10">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">صافي الربح الحقيقي للهيكل المالي</span>
                          <span className="text-2xl font-black">Net Profit (Final)</span>
                       </div>
                       <span suppressHydrationWarning className="text-4xl font-black tracking-tighter">{fmt(stats.netProfit)} <span className="text-xs opacity-50 mr-2">ج.م</span></span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Sales vs Expenses Visualization (CSS Based) */}
           <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                 <TrendingUp className="text-[#D4AF37]" size={24} />
                 المبيعات مقابل المصروفات (النسبة والتحليل)
              </h2>
              
              <div className="space-y-10">
                 <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-4">
                       <div>
                          <span className="text-[10px] font-black inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-50 mr-3">Profitability Ratio</span>
                       </div>
                       <div className="text-right">
                          <span className="text-sm font-black inline-block text-emerald-600 tracking-tight">{(profitRatio).toFixed(1)}%</span>
                       </div>
                    </div>
                    <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-100 shadow-inner">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${profitRatio}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-l from-emerald-500 to-emerald-400"
                        />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[8px] font-black text-gray-400 uppercase italic">
                       <span>صافي هامش الربح</span>
                       <span>المصروفات من المبيعات ({(expenseRatio).toFixed(1)}%)</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Side Column: Liquidity & Debt */}
        <div className="space-y-8">
           {/* Top Debtors */}
           <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                 <Users className="text-emerald-600" size={20} />
                 أكبر المديونيات للعملاء
              </h3>
              <div className="space-y-4">
                 {stats.topDebtors.map((debtor: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 flex items-center justify-between p-4 rounded-2xl group hover:bg-emerald-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm font-black text-xs">
                             {idx + 1}
                          </div>
                          <span className="text-sm font-bold text-gray-700">{debtor.name}</span>
                       </div>
                       <span suppressHydrationWarning className="font-black text-emerald-600 text-sm">{fmt(debtor.currentBalance)}</span>
                    </div>
                 ))}
                 {stats.topDebtors.length === 0 && <p className="text-xs text-gray-400 font-bold text-center italic py-4">لا يوجد مديونيات حالية</p>}
              </div>
           </div>

           {/* Top Creditors */}
           <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                 <Building2 className="text-red-500" size={20} />
                 أكبر مديونيات الموردين
              </h3>
              <div className="space-y-4">
                 {stats.topCreditors.map((creditor: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 flex items-center justify-between p-4 rounded-2xl group hover:bg-red-50 transition-colors text-left">
                       <span suppressHydrationWarning className="font-black text-red-500 text-sm">{fmt(creditor.currentBalance)}</span>
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">{creditor.name}</span>
                          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-red-500 shadow-sm font-black text-xs">
                             {idx + 1}
                          </div>
                       </div>
                    </div>
                 ))}
                 {stats.topCreditors.length === 0 && <p className="text-xs text-gray-400 font-bold text-center italic py-4 text-emerald-600">جميع المديونيات مسددة ✓</p>}
              </div>
           </div>

           {/* Inventory Value Breakdown Banner */}
           <div className="bg-[#1D1D1F] p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 h-32 w-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-white/10 rounded-xl text-[#D4AF37]">
                    <Package size={24} />
                 </div>
                 <h4 className="font-black text-lg tracking-tight">إجمالي قيمة الأصول (المخزن)</h4>
              </div>
              <p suppressHydrationWarning className="text-3xl font-black text-white tracking-tighter mb-2">
                 {fmt(stats.inventoryValuation?.total || 0)}
                 <span className="text-xs mr-2 text-white/50">ج.م</span>
              </p>
              <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between text-[11px] font-black text-white/70 uppercase">
                     <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        مخزن الخامات
                     </span>
                     <span>{fmt(stats.inventoryValuation?.rawMaterials || 0)} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-black text-white/70 uppercase">
                     <span className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        مخزن المنتج التام
                     </span>
                     <span>{fmt(stats.inventoryValuation?.finishedGoods || 0)} ج.م</span>
                  </div>
               </div>
              <div className="flex items-center justify-between text-[10px] font-black text-white/40 uppercase tracking-widest mt-8 pt-6 border-t border-white/5">
                 <span>Asset Valuation Summary</span>
                 <ArrowUpRight size={14} />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
