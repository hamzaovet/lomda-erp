'use client'

import React, { useTransition, useState } from 'react'
import { 
  X, 
  Banknote, 
  Loader2, 
  CheckCircle2,
  Calendar,
  Wallet,
  ArrowUpFromLine,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import { makeSupplierPayment } from '@/app/lib/actions/payments'

interface SupplierPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  supplier: any
}

const PAYMENT_METHODS = [
  { id: 'نقدي', label: 'نقدي (Cash)' },
  { id: 'تحويل بنكي', label: 'تحويل بنكي (Transfer)' },
  { id: 'شيك', label: 'شيك (Check)' }
]

export default function SupplierPaymentModal({ isOpen, onClose, onSuccess, supplier }: SupplierPaymentModalProps) {
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState<number>(0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('supplierId', supplier._id)
    
    startTransition(async () => {
      const result = await makeSupplierPayment(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error)
      }
    })
  }

  if (!isOpen || !supplier) return null

  const currentDebt = supplier.currentBalance || 0;
  const newDebt = currentDebt - (Number(amount) || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <ArrowUpFromLine size={30} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">سداد دفعة - سند صرف</h3>
              <p className="text-gray-400 font-bold italic text-sm">{supplier.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Balance Preview Card */}
        <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1 bg-red-500" />
          <div className="space-y-1 relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي المستحقات للمورد</p>
            <p suppressHydrationWarning className="text-2xl font-black text-gray-800 tracking-tighter">
              {currentDebt.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
              <span className="text-xs mr-2 text-gray-400">ج.م</span>
            </p>
          </div>
          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
             <Info size={16} />
          </div>
          <div className="space-y-1 relative z-10 text-left">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">الدين المتبقي</p>
            <p suppressHydrationWarning className="text-2xl font-black text-red-600 tracking-tighter">
              {newDebt.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
              <span className="text-xs mr-2 text-red-500/50">ج.م</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
              <Banknote size={12} />
              المبلغ المدفوع
            </label>
            <input 
              name="amount"
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black text-3xl text-center text-red-600"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Date */}
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
                 <Calendar size={12} />
                 التاريخ
               </label>
               <input 
                 name="date"
                 type="date"
                 defaultValue={new Date().toISOString().split('T')[0]}
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-sm"
               />
             </div>

             {/* Payment Method */}
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
                 <Wallet size={12} />
                 طريقة السداد
               </label>
               <select 
                 name="paymentMethod"
                 required
                 className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black text-sm appearance-none"
               >
                 {PAYMENT_METHODS.map(method => (
                   <option key={method.id} value={method.id}>{method.label}</option>
                 ))}
               </select>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest">البيان / ملاحظات</label>
            <textarea 
              name="description"
              rows={2}
              placeholder="وصف إضافي للعملية..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-gray-800 resize-none text-sm"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#1D1D1F] text-white py-5 rounded-3xl text-xl font-black shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>إصدار سند صرف</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
