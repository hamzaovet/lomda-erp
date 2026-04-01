'use client'

import React, { useTransition } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  PackageCheck
} from 'lucide-react'
import { motion } from 'framer-motion'
import { addSupplier, updateSupplier } from '@/app/lib/actions/suppliers'

interface SupplierModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  supplier?: any
}

export default function SupplierModal({ isOpen, onClose, onSuccess, supplier }: SupplierModalProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = supplier?._id 
        ? await updateSupplier(supplier._id, formData)
        : await addSupplier(formData)

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
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 ${supplier ? 'bg-blue-600 shadow-blue-600/20' : 'bg-[#D4AF37] shadow-[#D4AF37]/20'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {supplier ? <ShieldCheck size={32} /> : <Building2 size={32} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">{supplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h3>
              <p className="text-gray-400 font-bold italic">{supplier ? `تعديل ملف: ${supplier.name}` : 'تسجيل مورد خامات أو بضائع جاهزة.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">اسم المورد</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                name="name"
                required
                defaultValue={supplier?.name || ''}
                placeholder="مثال: شركة الأمل للكيماويات"
                className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  name="phone"
                  required
                  defaultValue={supplier?.phone || ''}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">نوع المورد</label>
              <div className="relative">
                <PackageCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <select 
                  name="category"
                  required
                  defaultValue={supplier?.category || 'Raw'}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black appearance-none"
                >
                  <option value="Raw">مورد خامات</option>
                  <option value="Finished">مورد بضائع جاهزة</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الرصيد الحالي (ج.م)</label>
            <input 
              name="currentBalance"
              type="number"
              defaultValue={supplier?.currentBalance || 0}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-center"
            />
            <p className="text-[8px] text-gray-400 font-bold mt-1 text-center">الموجب: رصيد دائن للمورد (فلوس له) | السالب: مدين لنا (فلوس عليه)</p>
          </div>

          <div className="pt-6 border-t border-gray-100 shrink-0">
            <button 
              type="submit"
              disabled={isPending}
              className={`w-full ${supplier ? 'bg-blue-600 shadow-blue-600/20' : 'bg-[#D4AF37] shadow-[#D4AF37]/20'} text-white py-5 rounded-3xl text-xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3`}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  <span>{supplier ? 'حفظ التعديلات' : 'تسجيل المورد'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
