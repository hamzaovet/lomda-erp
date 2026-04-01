'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  ShoppingCart,
  RotateCcw,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Calendar,
  Plus,
  Filter,
  Download,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getRawMaterials, getPurchaseInvoices } from '@/app/lib/actions/purchases'
import PurchaseInvoiceModal from '@/app/dashboard/manufacturing/PurchaseInvoiceModal'
import PurchaseReturnModal from '@/app/dashboard/manufacturing/PurchaseReturnModal'

export default function PurchasesPage() {
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isPurchaseReturnModalOpen, setIsPurchaseReturnModalOpen] = useState(false)
  
  const [isPending, startTransition] = useTransition()

  const fetchPurchases = async () => {
    setIsLoadingPurchases(true)
    try {
      const data = await getPurchaseInvoices()
      setPurchaseInvoices(data)
    } catch (error) {
      console.error("Failed to fetch purchases:", error)
    } finally {
      setIsLoadingPurchases(false)
    }
  }

  useEffect(() => {
    fetchPurchases()
  }, [])

  // Calculate Stats
  const totalPurchases = purchaseInvoices
    .filter(i => i.invoiceType !== 'return')
    .reduce((sum, i) => sum + i.totalAmount, 0)
    
  const totalReturns = purchaseInvoices
    .filter(i => i.invoiceType === 'return')
    .reduce((sum, i) => sum + i.totalAmount, 0)
    
  const netPurchases = totalPurchases - totalReturns

  return (
    <div className="flex flex-col gap-10 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">إدارة المشتريات والتوريدات</h1>
          <p className="text-gray-500 font-bold italic mt-1">تتبع المشتريات، المرتجعات، وتكاليف المواد الخام والمنتجات الجاهزة.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPurchaseReturnModalOpen(true)}
            className="flex items-center gap-2 bg-red-50 text-red-600 border-2 border-red-100 px-6 py-3 rounded-2xl font-black hover:bg-red-100 active:scale-95 transition-all shadow-sm"
          >
            <RotateCcw size={20} />
            <span>إضافة مرتجع</span>
          </button>

          <button 
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AF37] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <ShoppingCart size={20} />
            <span>تسجيل فاتورة شراء</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: "إجمالي المشتريات", 
            value: `${totalPurchases.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, 
            icon: ShoppingCart, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5" 
          },
          { 
            label: "إجمالي المرتجعات", 
            value: `${totalReturns.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, 
            icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" 
          },
          { 
            label: "صافي المشتريات", 
            value: `${netPurchases.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, 
            icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" 
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className="text-gray-300">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm mb-1">{stat.label}</p>
              <p suppressHydrationWarning className="text-2xl font-black text-gray-800">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase History Table */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-10 w-1.5 rounded-full bg-[#1D1D1F]" />
               <h2 className="text-2xl font-black text-gray-800">سجل فواتير الشراء والمرتجعات</h2>
            </div>
            
            {/* Filter/Search placeholder for premium feel */}
            <div className="flex items-center gap-2">
               <div className="relative group">
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="بحث في الفواتير..." 
                    className="bg-white border border-gray-100 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all w-60"
                  />
               </div>
               <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-[#D4AF37] transition-colors">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         {isLoadingPurchases ? (
            <div className="bg-white rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100">
               <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
               <p className="text-gray-400 font-bold italic">جاري تحميل سجل المشتريات...</p>
            </div>
         ) : (
            <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse min-w-[1000px]">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">رقم الفاتورة</th>
                           <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                           <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">المورد</th>
                           <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">الأصناف</th>
                           <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">الإجمالي</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 uppercase">
                        {purchaseInvoices.map((invoice) => {
                           const isReturn = invoice.invoiceType === 'return';
                           return (
                              <tr key={invoice._id} className={`${isReturn ? 'bg-red-50/40 hover:bg-red-50 transition-colors' : 'hover:bg-gray-50/50 transition-all'}`}>
                                 <td className="px-10 py-8 text-right">
                                    <div className="flex flex-col gap-1 items-start">
                                      <span className={`font-black ${isReturn ? 'text-red-400 bg-red-100' : 'text-gray-400 bg-gray-100'} px-3 py-1.5 rounded-lg text-xs tracking-tight w-fit`}>
                                         {invoice.invoiceNumber}
                                      </span>
                                      {isReturn && <span className="text-[10px] font-black text-red-600 mr-1 italic">● مرتجع مشتريات</span>}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-2 font-bold text-gray-400 text-sm">
                                       <Calendar size={14} />
                                       {new Date(invoice.createdAt || invoice.date).toLocaleDateString('ar-EG')}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <span className="font-black text-gray-800">{invoice.supplier?.name || "مورد مجهول"}</span>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex flex-col gap-1">
                                       {invoice.items.map((item: any, idx: number) => (
                                          <span key={idx} className="text-xs font-bold text-gray-500">
                                             - {item.material?.name || item.product?.name}: {item.qty} {item.material?.unit || item.product?.baseUnitName || 'وحدة'}
                                          </span>
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex flex-col">
                                       <span suppressHydrationWarning className={`text-xl font-black ${isReturn ? 'text-red-600' : 'text-gray-800'}`}>
                                          {isReturn ? '-' : ''} {invoice.totalAmount.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                                       </span>
                                       <span className="text-[10px] font-black text-gray-300 uppercase leading-none">جنيه مصري</span>
                                    </div>
                                 </td>
                              </tr>
                            );
                        })}
                        {purchaseInvoices.length === 0 && (
                           <tr>
                              <td colSpan={5} className="py-20 text-center text-gray-400 font-bold italic">لا توجد فواتير مشتريات مسجلة حتى الآن.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>

      {/* Shared Modals */}
      <PurchaseInvoiceModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={fetchPurchases}
      />
      <PurchaseReturnModal 
        isOpen={isPurchaseReturnModalOpen}
        onClose={() => setIsPurchaseReturnModalOpen(false)}
        onSuccess={fetchPurchases}
      />
    </div>
  )
}
