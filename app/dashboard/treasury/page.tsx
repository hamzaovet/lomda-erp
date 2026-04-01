'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Wallet, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Filter, 
  Loader2,
  Calendar,
  Banknote,
  TrendingDown,
  History,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getTreasuryBalance, getTreasuryTransactions, getExpenses } from '@/app/lib/actions/finance'
import ExpenseModal from './ExpenseModal'
import DepositModal from './DepositModal'

export default function TreasuryPage() {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'ledger' | 'expenses'>('ledger')
  
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    const [bData, tData, eData] = await Promise.all([
      getTreasuryBalance(),
      getTreasuryTransactions(),
      getExpenses()
    ])
    setBalance(bData)
    setTransactions(tData)
    setExpenses(eData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredExpenses = expenses.filter(e => 
    e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex flex-col gap-10 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
             <Wallet className="text-[#D4AF37]" size={40} />
             الخزينة والمصروفات
          </h1>
          <p className="text-gray-500 font-bold italic">إدارة التدفقات النقدية والرقابة المالية اللحظية.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDepositModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-white text-gray-800 border-2 border-gray-100 px-8 py-4 rounded-[2rem] font-black hover:border-[#D4AF37] hover:text-[#D4AF37] active:scale-95 transition-all shadow-sm"
          >
            <History size={24} />
            <span className="text-lg">إيداع / رصيد افتتاحي</span>
          </button>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-red-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-2xl shadow-red-600/30 hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Receipt size={28} />
            <span className="text-xl">تسجيل مصروف</span>
          </button>
        </div>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Main Balance Card */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1D1D1F] p-10 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl"
         >
            <div className="absolute -right-20 -top-20 h-64 w-64 bg-[#D4AF37]/10 rounded-full blur-3xl group-hover:bg-[#D4AF37]/20 transition-all duration-700" />
            <div className="relative z-10 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[#D4AF37]">
                     <Banknote size={32} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                     الرصيد الفعلي الحالي
                  </div>
               </div>
               <div>
                  <h2 
                    suppressHydrationWarning 
                    className="text-6xl font-black tracking-tighter"
                  >
                    {balance.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                    <span className="text-2xl text-[#D4AF37] mr-3 font-bold">ج.م</span>
                  </h2>
                  <p className="text-gray-500 font-bold mt-4 italic">يتضمن كافة الإيرادات ناقص المصروفات والدفعات.</p>
               </div>
            </div>
         </motion.div>

         {/* Secondary Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:rotate-12 transition-transform">
                     <TrendingDown size={28} />
                  </div>
                  <ArrowUpRight className="text-gray-200" size={24} />
               </div>
               <div>
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">إجمالي المصروفات التشغيلية</p>
                  <p suppressHydrationWarning className="text-3xl font-black text-gray-800 tracking-tight">
                    {totalExpenseSum.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                    <span className="text-sm mr-2 text-gray-400">ج.م</span>
                  </p>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
               <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:-rotate-12 transition-transform">
                     <History size={28} />
                  </div>
                  <ArrowUpRight className="text-gray-200" size={24} />
               </div>
               <div>
                  <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">إجمالي الحركات (In/Out)</p>
                  <p className="text-3xl font-black text-gray-800 tracking-tight">
                    {transactions.length}
                    <span className="text-sm mr-2 text-gray-400">عملية</span>
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-gray-100 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-10 py-4 rounded-[2rem] font-black transition-all flex items-center gap-2 ${
            activeTab === 'ledger' 
              ? 'bg-[#1D1D1F] text-[#D4AF37] shadow-lg scale-105' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <History size={20} />
          <span>حركة الخزينة (Ledger)</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-10 py-4 rounded-[2rem] font-black transition-all flex items-center gap-2 ${
            activeTab === 'expenses' 
              ? 'bg-[#1D1D1F] text-[#D4AF37] shadow-lg scale-105' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Receipt size={20} />
          <span>سجل المصروفات التشغيلية</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm sticky top-0 z-10 translate-y-0">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
            <input
              type="text"
              placeholder="ابحث في الوصف أو التصنيف..."
              className="w-full bg-gray-50/50 border border-transparent rounded-[1.5rem] py-4 pr-12 pl-4 outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-2xl text-gray-500 font-bold text-sm hover:bg-gray-100 transition-all border border-transparent">
             <Filter size={18} />
             <span>تصفية المخرجات</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-[#D4AF37]" size={64} />
             <p className="text-gray-400 font-black italic text-lg tracking-widest uppercase">جاري مطابقة الأرصدة...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
             {activeTab === 'ledger' ? (
                /* Ledger Table */
                <table className="w-full text-right border-collapse">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">نوع العملية</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">التصنيف</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">المبلغ</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">البيان</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredTransactions.map((t) => (
                         <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-10 py-6">
                               <div className={`flex items-center gap-3 font-black text-xs px-4 py-2 rounded-xl w-fit ${
                                 t.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                               }`}>
                                  {t.type === 'in' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  {t.type === 'in' ? 'إيداع / وارد' : 'سحب / صادر'}
                               </div>
                            </td>
                            <td className="px-10 py-6">
                                <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-black text-gray-500">
                                   {t.category === 'sales_revenue' ? 'مبيعات' : 
                                    t.category === 'purchase_payment' ? 'مشتريات' : 
                                    t.category === 'expense' ? 'مصروفات' : 
                                    t.category === 'capital' ? 'رأس مال' : 'أخرى'}
                                </span>
                            </td>
                            <td className="px-10 py-6">
                               <span suppressHydrationWarning className={`text-xl font-black ${t.type === 'in' ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {t.type === 'in' ? '+' : '-'} {t.amount.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                               </span>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                  <Calendar size={14} />
                                  {new Date(t.date).toLocaleDateString('ar-EG')}
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <p className="text-gray-800 font-bold text-sm max-w-sm truncate">{t.description}</p>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             ) : (
                /* Expenses Table */
                <table className="w-full text-right border-collapse">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">التصنيف</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">القيمة</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                         <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center italic">توضيح المصروف</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {filteredExpenses.map((e) => (
                         <tr key={e._id} className="hover:bg-red-50/20 transition-colors">
                            <td className="px-10 py-6">
                               <span className="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-black">
                                  {e.category}
                               </span>
                            </td>
                            <td className="px-10 py-6">
                               <span suppressHydrationWarning className="text-xl font-black text-red-600">
                                  {e.amount.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                               </span>
                            </td>
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                                  <Calendar size={14} />
                                  {new Date(e.date).toLocaleDateString('ar-EG')}
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <p className="text-gray-600 font-bold text-sm bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                                  {e.description}
                               </p>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             )}
             
             {((activeTab === 'ledger' && filteredTransactions.length === 0) || (activeTab === 'expenses' && filteredExpenses.length === 0)) && (
                <div className="py-40 flex flex-col items-center justify-center bg-gray-50/30">
                   <div className="h-24 w-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-100 mb-6">
                      <History size={48} />
                   </div>
                   <p className="text-gray-400 font-black italic text-xl">لا يوجد بيانات لعرضها في هذا القسم حالياً.</p>
                </div>
             )}
          </div>
        )}
      </div>

      {/* Modals */}
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={fetchData}
      />
      <DepositModal 
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
