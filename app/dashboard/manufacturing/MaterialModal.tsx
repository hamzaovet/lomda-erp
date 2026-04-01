'use client'

import React, { useState, useTransition } from 'react'
import { 
  X, 
  Plus, 
  Beaker, 
  Loader2, 
  CheckCircle2,
  Hash,
  Scale
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addRawMaterial } from '@/app/lib/actions/materials'

interface MaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function MaterialModal({ isOpen, onClose, onSuccess }: MaterialModalProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await addRawMaterial(formData)
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
            <div className="h-14 w-14 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20">
              <Beaker size={30} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">إضافة خامة جديدة</h3>
              <p className="text-gray-400 font-bold italic">قم بتعريف صنف خامة جديد في النظام.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest">اسم الخامة</label>
            <div className="relative">
              <Beaker className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="name"
                required
                placeholder="مثال: تيكسابون N70"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest">كود الخامة (فريد)</label>
              <div className="relative">
                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  name="code"
                  required
                  placeholder="RM-XXXX"
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-gray-800"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest">وحدة القياس</label>
              <div className="relative">
                <Scale className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <select 
                  name="unit"
                  required
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-gray-800 appearance-none"
                >
                  <option value="Kg">كيلوجرام (Kg)</option>
                  <option value="Liter">لتر (Liter)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest">الحد الأدنى للرصيد (Alert Level)</label>
            <input 
              name="minLevel"
              type="number"
              required
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-gray-800 text-center text-xl"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-[#D4AF37] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  <span>تسجيل الخامة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
