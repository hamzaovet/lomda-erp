'use client'

import React, { useTransition } from 'react'
import { 
  X, 
  Receipt, 
  Loader2, 
  CheckCircle2,
  Tag,
  AlignLeft,
  Banknote
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addExpense } from '@/app/lib/actions/finance'

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIES = [
  { id: 'رواتب', label: 'رواتب' },
  { id: 'إيجار', label: 'إيجار' },
  { id: 'مرافق', label: 'مرافق (كهرباء/مياه)' },
  { id: 'تسويق', label: 'تسويق' },
  { id: 'نثريات', label: 'نثريات' },
  { id: 'أخرى', label: 'أخرى' }
]

export default function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addExpense(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error)
      }
    })
  }

  if (!isOpen) return null

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
              <Receipt size={30} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">تسجيل مصروف جديد</h3>
              <p className="text-gray-400 font-bold italic text-sm">سيتم خصم المبلغ من الخزينة آلياً.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
              <Banknote size={12} />
              قيمة المصروف
            </label>
            <input 
              name="amount"
              type="number"
              required
              step="0.01"
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black text-3xl text-center text-red-600"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
              <Tag size={12} />
              التصنيف
            </label>
            <select 
              name="category"
              required
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black text-gray-800 appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={12} />
              البيان / الوصف
            </label>
            <textarea 
              name="description"
              required
              rows={3}
              placeholder="اكتب تفاصيل المصروف هنا..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold text-gray-800 resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-red-600 text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>جاري المعالجة...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>تأكيد وتسجيل المصروف</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
