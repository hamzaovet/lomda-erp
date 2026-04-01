'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck,
  TrendingUp,
  Store,
  Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addCustomer, updateCustomer } from '@/app/lib/actions/customers'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customer?: any
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
  const [isPending, startTransition] = useTransition()
  const [customerType, setCustomerType] = useState(customer?.customerType || 'external')
  const [tier, setTier] = useState(customer?.pricingTier || 'قطاعي')

  useEffect(() => {
    if (customer) {
      setCustomerType(customer.customerType)
      setTier(customer.pricingTier)
    } else {
      setCustomerType('external')
      setTier('قطاعي')
    }
  }, [customer])

  // Reset tier to Retail if it's an internal branch
  useEffect(() => {
    if (customerType === 'internal_branch') {
       setTier('قطاعي')
    }
  }, [customerType])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = customer?._id 
        ? await updateCustomer(customer._id, formData)
        : await addCustomer(formData)

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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 ${customer ? 'bg-blue-600 shadow-blue-600/20' : 'bg-[#D4AF37] shadow-[#D4AF37]/20'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {customer ? <ShieldCheck size={32} /> : <User size={32} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">{customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
              <p className="text-gray-400 font-bold italic">{customer ? `تعديل ملف: ${customer.name}` : 'تسجيل عميل جديد أو فرع داخلي في لؤلؤة العمدة.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
            
            {/* Customer Type Toggle */}
            <div className="bg-gray-50 p-2 rounded-2xl flex items-center gap-2">
               <button 
                  type="button"
                  onClick={() => setCustomerType('external')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${customerType === 'external' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <Users size={18} />
                  <span>عميل سوق خارجي</span>
               </button>
               <button 
                  type="button"
                  onClick={() => setCustomerType('internal_branch')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${customerType === 'internal_branch' ? 'bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/20' : 'text-gray-400 hover:text-gray-600'}`}
               >
                  <Store size={18} />
                  <span>فرع داخلي (المحل)</span>
               </button>
               <input type="hidden" name="customerType" value={customerType} />
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    name="name"
                    required
                    defaultValue={customer?.name || ''}
                    placeholder="مثال: شركة لؤلؤة العمدة للتوريدات"
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
                      defaultValue={customer?.phone || ''}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">العنوان</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      name="address"
                      defaultValue={customer?.address || ''}
                      placeholder="عزبة النخل، القاهرة"
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] pr-2 uppercase">فئة التسعير</label>
                  <div className="relative">
                    <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={18} />
                    <select 
                      name="pricingTier"
                      required
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black appearance-none disabled:bg-gray-50"
                      disabled={customerType === 'internal_branch'}
                    >
                      <option value="قطاعي">قطاعي</option>
                      <option value="جملة">جملة</option>
                      <option value="موزع">موزع</option>
                      <option value="مندوب">مندوب</option>
                    </select>
                  </div>
                  {customerType === 'internal_branch' && (
                    <p className="text-[8px] text-[#D4AF37] font-bold mt-1">* الفروع تتبع تسعير القطاعي تلقائياً</p>
                  )}
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الرصيد الافتتاحي (ج.م)</label>
                  <input 
                    name="currentBalance"
                    type="number"
                    defaultValue={customer?.currentBalance || 0}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-center"
                  />
                  <p className="text-[8px] text-gray-400 font-bold mt-1 text-center">الموجب: مديونية لنا | السالب: رصيد للعميل</p>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 shrink-0">
            <button 
              type="submit"
              disabled={isPending}
              className={`w-full ${customer ? 'bg-blue-600 shadow-blue-600/20' : 'bg-[#D4AF37] shadow-[#D4AF37]/20'} text-white py-5 rounded-3xl text-xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3`}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  <span>{customer ? 'حفظ التعديلات' : 'تسجيل العميل'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
