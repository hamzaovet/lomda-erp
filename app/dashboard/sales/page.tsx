'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  TrendingUp, 
  Banknote, 
  CreditCard,
  Loader2,
  Calendar,
  User,
  ArrowUpRight,
  Eye,
  FileDown,
  Filter,
  RotateCcw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getSalesInvoices, deleteSalesInvoice } from '@/app/lib/actions/sales'
import SalesInvoiceModal from './SalesInvoiceModal'
import SalesReturnModal from './SalesReturnModal'
import InvoiceViewModal from './InvoiceViewModal'

export default function SalesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchInvoices = async () => {
    setIsLoading(true)
    const data = await getSalesInvoices()
    setInvoices(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  const handleDelete = async (id: string) => {
    const pin = window.prompt("لإتمام الحذف وعكس حركة المخزن، يرجى إدخال الرقم السري للمدير:");
    if (pin !== "2026") return alert("رمز الحماية غير صحيح.");

    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟ سيتم إرجاع البضاعة للمخزن وتعديل حساب العميل آلياً.')) return

    const result = await deleteSalesInvoice(id)
    if (result.success) {
      alert("تم حذف الفاتورة وعكس كافة آثارها بنجاح.")
      fetchInvoices()
    } else {
      alert(result.error)
    }
  }

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const today = new Date().toISOString().split('T')[0]
  const todayInvoices = invoices.filter(inv => inv.date.startsWith(today) && inv.invoiceType !== 'return')
  const todayReturns = invoices.filter(inv => inv.date.startsWith(today) && inv.invoiceType === 'return')
  
  const todaySales = todayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const todayReturnAmount = todayReturns.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)

  const totalInvoicesAmount = invoices.filter(inv => inv.invoiceType !== 'return').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  const totalReturnsAmount = invoices.filter(inv => inv.invoiceType === 'return').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
  
  const netSales = totalInvoicesAmount - totalReturnsAmount
  const cashCollected = invoices.reduce((sum, inv) => {
    // In returns, amountPaid tracks the REFUNDED cash, so it should be subtracted from total cash collected
    return inv.invoiceType === 'return' ? sum - (inv.amountPaid || 0) : sum + (inv.amountPaid || 0)
  }, 0)

  return (
    <div className="flex flex-col gap-8 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-gray-800 tracking-tight flex items-center gap-4">
             <ShoppingCart className="text-[#D4AF37]" size={40} />
             فواتير المبيعات
          </h1>
          <p className="text-gray-500 font-bold italic">إصدار فواتير العملاء وتحصيل الإيرادات بضغطة زر واحدة.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsReturnModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-red-50 text-red-600 border-2 border-red-100 px-8 py-4 rounded-[2rem] font-black hover:bg-red-100 active:scale-95 transition-all shadow-sm"
          >
            <RotateCcw size={24} />
            <span className="text-lg">إضافة مرتجع</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 bg-[#D4AF37] text-white px-10 py-4 rounded-[2rem] font-black shadow-2xl shadow-[#D4AF37]/30 hover:scale-[1.03] active:scale-95 transition-all"
          >
            <Plus size={28} />
            <span className="text-xl">إصدار فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "صافي مبيعات اليوم", value: `${(todaySales - todayReturnAmount).toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, icon: Calendar, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5" },
          { label: "إجمالي المرتجعات", value: `${totalReturnsAmount.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, icon: RotateCcw, color: "text-red-600", bg: "bg-red-50" },
          { label: "صافي المبيعات (كلي)", value: `${netSales.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 group hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-5 rounded-[1.5rem] ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={32} />
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-200">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-1">{stat.label}</p>
              <p suppressHydrationWarning className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-2 z-10">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة أو اسم العميل..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pr-12 pl-4 outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex gap-3">
           <button className="flex items-center gap-2 px-6 py-4 bg-white rounded-2xl border border-gray-200 text-gray-500 font-black text-sm hover:bg-gray-50 transition-all">
              <Filter size={18} />
              <span>تصفية</span>
           </button>
        </div>
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
           <Loader2 className="animate-spin text-[#D4AF37]" size={64} />
           <p className="text-gray-400 font-black italic text-lg">جاري تحميل الفواتير الحديثة...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-right border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">رقم الفاتورة</th>
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">التاريخ</th>
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">العميل</th>
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">التحصيل</th>
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest">إجمالي الفاتورة</th>
                  <th className="px-10 py-8 text-[12px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map((invoice) => {
                  const isReturn = invoice.invoiceType === 'return';
                  const isFullyPaid = invoice.amountPaid >= invoice.totalAmount;
                  const balance = invoice.totalAmount - invoice.amountPaid;

                  return (
                    <tr key={invoice._id} className={`${isReturn ? 'bg-red-50/40 hover:bg-red-50 transition-colors' : 'hover:bg-gray-50/50 transition-all'} group border-none`}>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                          <span className={`font-black ${isReturn ? 'text-red-400 bg-red-100' : 'text-gray-400 bg-gray-100'} px-3 py-1.5 rounded-lg text-xs tracking-tight group-hover:text-gray-800 transition-colors w-fit`}>
                             {invoice.invoiceNumber}
                          </span>
                          {isReturn && <span className="text-[10px] font-black text-red-600 mr-1 uppercase tracking-tighter italic font-black">● مرتجع مبيعات</span>}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 font-bold text-gray-400 text-sm">
                           <Calendar size={14} />
                           {new Date(invoice.date).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-300">
                              <User size={22} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-gray-800">{invoice.customer?.name || "عميل مجهول"}</span>
                              <span className="text-[10px] font-black text-[#D4AF37] uppercase">{invoice.customer?.pricingTier}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        {isFullyPaid ? (
                           <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-600 w-fit text-[11px] font-black border border-emerald-100">
                              <CreditCard size={14} />
                              <span>خالصة كلياً</span>
                           </div>
                        ) : (
                           <div className="flex flex-col">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-600 w-fit text-[11px] font-black border border-amber-100">
                                 <Plus size={14} />
                                 <span>آجل: {balance.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م</span>
                              </div>
                           </div>
                        )}
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col">
                           <span suppressHydrationWarning className={`text-xl font-black ${isReturn ? 'text-red-600' : 'text-gray-800'}`}>
                              {isReturn ? '-' : ''} {invoice.totalAmount.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                           </span>
                           <span className="text-[10px] font-black text-gray-300 uppercase leading-none">جنيه مصري</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-center gap-3">
                           <button 
                              onClick={() => {
                                 setSelectedInvoice(invoice);
                                 setIsViewModalOpen(true);
                              }}
                              className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100"
                           >
                              <Eye size={20} />
                           </button>
                           <button 
                              onClick={() => {
                                 setSelectedInvoice(invoice);
                                 setIsViewModalOpen(true);
                              }}
                              className="p-3 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100"
                           >
                              <FileDown size={20} />
                           </button>
                           <button 
                              onClick={() => handleDelete(invoice._id)}
                              className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                           >
                              <Plus className="rotate-45" size={20} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredInvoices.length === 0 && (
             <div className="py-32 flex flex-col items-center justify-center bg-gray-50/50">
                <ShoppingCart className="text-gray-100 mb-4" size={100} />
                <p className="text-gray-400 font-bold italic text-xl tracking-tight">لا توجد فواتير مبيعات مسجلة حالياً.</p>
             </div>
          )}
        </div>
      )}

      {/* Modal */}
      <SalesInvoiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchInvoices}
      />

      <SalesReturnModal 
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onSuccess={fetchInvoices}
      />

      <InvoiceViewModal 
        isOpen={isViewModalOpen}
        onClose={() => {
           setIsViewModalOpen(false);
           setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  )
}
