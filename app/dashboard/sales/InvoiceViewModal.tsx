'use client'

import React from 'react'
import { 
  X, 
  Printer, 
  ShoppingCart, 
  User, 
  Calendar, 
  Hash,
  Package,
  Banknote,
  CreditCard
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InvoiceViewModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: any
}

export default function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  if (!isOpen || !invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const remainingBalance = invoice.totalAmount - (invoice.amountPaid || 0)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:p-0 print:rounded-none"
        dir="rtl"
      >
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:flex flex-col items-center mb-10 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-2">لؤلؤة العمدة (Lomda ERP)</h1>
            <p className="text-sm font-bold text-gray-500">للمنظفات والمطهرات والحلول الصناعية</p>
            <div className="w-full h-px bg-gray-200 mt-6 mb-2"></div>
            <h2 className="text-2xl font-black uppercase tracking-widest">فاتورة مبيعات الأصلية</h2>
        </div>

        {/* Modal Controls - Hidden when printing */}
        <div className="flex items-center justify-between mb-10 shrink-0 print:hidden">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gray-800 rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-lg">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">عرض تفاصيل الفاتورة</h3>
              <p className="text-gray-400 font-bold italic">رقم: {invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={handlePrint}
                className="h-12 px-6 bg-[#D4AF37] text-white rounded-xl flex items-center justify-center gap-2 font-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.05] active:scale-95 transition-all"
             >
                <Printer size={20} />
                <span>طباعة</span>
             </button>
             <button onClick={onClose} className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="print-area" className="space-y-8">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 rounded-3xl p-8 print:bg-transparent print:border print:border-gray-100">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <Hash size={12} /> رقم الفاتورة
                    </p>
                    <p className="text-lg font-black text-gray-800 tracking-tight">{invoice.invoiceNumber}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <Calendar size={12} /> تاريخ الإصدار
                    </p>
                    <p className="text-lg font-black text-gray-800">{new Date(invoice.date).toLocaleDateString('ar-EG')}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                        <User size={12} /> اسم العميل
                    </p>
                    <p className="text-lg font-black text-gray-800">{invoice.customer?.name || "عميل مجهول"}</p>
                    <p className="text-[10px] font-black text-[#D4AF37] uppercase">{invoice.customer?.pricingTier}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 px-2 uppercase tracking-widest flex items-center gap-2">
                    <Package size={16} className="text-[#D4AF37]" />
                    تفاصيل البنود المباعة
                </h4>
                <div className="border border-gray-100 rounded-[2rem] overflow-hidden print:rounded-none">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400">المنتج</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 text-center">الكمية</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 text-center">سعر الوحدة</th>
                                <th className="px-6 py-4 text-[11px] font-black text-gray-400 text-center">إجمالي البند</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoice.items.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-gray-800">{item.product?.name || "منتج غير معروف"}</p>
                                        <p className="text-[9px] font-bold text-gray-400">{item.product?.sku}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="font-black text-gray-700">
                                            {item.qtyCartons > 0 && <span>{item.qtyCartons} كرتونة </span>}
                                            {item.qtyPieces > 0 && <span>{item.qtyPieces} قطعة</span>}
                                        </div>
                                    </td>
                                    <td suppressHydrationWarning className="px-6 py-4 text-center font-black text-gray-600">
                                        {item.unitPrice.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                                    </td>
                                    <td suppressHydrationWarning className="px-6 py-4 text-center font-black text-emerald-600">
                                        {item.lineTotal.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col md:flex-row justify-between gap-8 pt-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400">طريقة السداد</p>
                            <p className="font-black text-gray-800 uppercase text-xs">{invoice.paymentMethod === 'Cash' ? 'نقدي (كاش)' : invoice.paymentMethod}</p>
                        </div>
                    </div>
                    {remainingBalance > 0 && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 print:bg-transparent">
                            <p className="text-[10px] font-black text-amber-600 uppercase">المتبقي على العميل (آجل)</p>
                            <p suppressHydrationWarning className="text-xl font-black text-amber-700">{remainingBalance.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م</p>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-80 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden print:bg-white print:text-black print:border print:border-gray-900">
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-xs font-black uppercase">إجمالي الفاتورة:</span>
                            <span suppressHydrationWarning className="font-black">{invoice.totalAmount.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م</span>
                        </div>
                        <div className="flex justify-between items-center opacity-60">
                            <span className="text-xs font-black uppercase">المحقق/المدفوع:</span>
                            <span suppressHydrationWarning className="font-black">{invoice.amountPaid.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م</span>
                        </div>
                        <div className="h-px bg-white/20 my-4"></div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-black uppercase text-[#D4AF37]">الصافي المستحق:</span>
                            <div className="flex items-baseline gap-1">
                                <span suppressHydrationWarning className="text-3xl font-black">{invoice.totalAmount.toLocaleString('ar-EG', { numberingSystem: 'latn' })}</span>
                                <span className="text-sm font-black text-[#D4AF37]">ج.م</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-20 pt-10 border-t border-dashed border-gray-300 text-center">
                <p className="text-sm font-black text-gray-800 mb-1">شكراً لتعاملكم مع مؤسستنا!</p>
                <p className="text-[10px] font-bold text-gray-400 italic italic">تم استخراج هذه الفاتورة آلياً عبر نظام Lomda ERP.</p>
            </div>
        </div>

        {/* Global Print Styles */}
        <style jsx global>{`
          @media print {
            body { 
              visibility: hidden; 
              background: white;
            }
            #print-area { 
              visibility: visible; 
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 40px;
            }
            .no-print { display: none !important; }
          }
        `}</style>
      </motion.div>
    </div>
  )
}
