'use client'

import React, { useState, useTransition } from 'react'
import { 
  X, 
  Plus, 
  Package, 
  Loader2, 
  CheckCircle2, 
  Hash,
  Layers,
  Banknote,
  Users,
  Target,
  Pencil,
  TrendingUp,
  ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProduct, addProduct } from '@/app/lib/actions/products'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: any // For editing
  activeTabType: 'manufactured' | 'traded'
}

export default function ProductModal({ isOpen, onClose, onSuccess, product, activeTabType }: ProductModalProps) {
  const [isPending, startTransition] = useTransition()
  const [productType, setProductType] = useState(activeTabType)
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  // SURGICAL FIX: Reset modal state on open to prevent "LUBIA" effect (state leakage)
  React.useEffect(() => {
    if (isOpen) {
      // SECURE IDENTITY: Ensure productType is strictly set from product when editing
      setProductType(product?.productType || activeTabType)
      setImageUrl(product?.imageUrl || '')
    }
  }, [isOpen, product, activeTabType])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const uploadFormData = new FormData()
    uploadFormData.append('image', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const result = await response.json()
      if (result.success) {
        setImageUrl(result.url)
      } else {
        alert(result.error || 'فشل رفع الصورة')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('حدث خطأ أثناء رفع الصورة')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate if image is still uploading
    if (isUploading) {
      return alert('الرجاء الانتظار حتى ينتهي رفع الصورة')
    }

    const form = e.currentTarget
    const formData = new FormData(form)
    
    // CRITICAL: Explicitly append to ensure no loss of data in pipe
    if (imageUrl) formData.append('imageUrl', imageUrl) 
    formData.append('productType', String(productType)) // ID GUARD: Secure Identity Guard 🛡️
    
    console.log("📤 Submitting Product Data...", Object.fromEntries(formData.entries()))

    startTransition(async () => {
      try {
        const result = product?._id 
          ? await updateProduct(product._id, formData)
          : await addProduct(formData)

        if (result.success) {
          onSuccess()
          onClose()
        } else {
          // Visible error reporting
          console.error("❌ Server Action Failed:", result.error)
          alert(`خطأ في الحفظ: ${result.error}`)
        }
      } catch (err: any) {
        console.error("❌ Unexpected Submission Error:", err)
        alert("حدث خطأ غير متوقع أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.")
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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 ${product ? 'bg-blue-600' : 'bg-[#D4AF37]'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              {product ? <Pencil size={32} /> : <Package size={32} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">{product ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h3>
              <p className="text-gray-400 font-bold italic">{product ? `تعديل: ${product.name}` : 'تسجيل منتج جديد في قائمة المبيعات والمخزن.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form 
          key={product?._id || `new-${activeTabType}`} // Force re-render to clear fields
          onSubmit={handleSubmit} 
          className="flex-1 flex flex-col overflow-hidden text-right"
          dir="rtl"
        >
          <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
            
            {/* Product Type (Hidden Context) */}
            <input type="hidden" name="productType" value={productType || ""} />

            {/* Image Upload Integration */}
            <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
               <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic tracking-widest">صورة المنتج</label>
                <div className="relative group flex items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-4 transition-all hover:border-[#D4AF37] h-48 overflow-hidden">
                   {imageUrl ? (
                     <>
                       <img src={imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white text-gray-800 px-6 py-2 rounded-xl font-black text-xs shadow-lg">تغيير الصورة</label>
                       </div>
                     </>
                   ) : isUploading ? (
                     <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                        <span className="text-xs font-black text-gray-400 uppercase italic">جاري الرفع...</span>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-[#D4AF37] transition-colors">
                        <Plus size={48} />
                        <span className="text-xs font-black uppercase italic">اضغط لرفع صورة</span>
                     </div>
                   )}
                   <input 
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <input type="hidden" name="imageUrl" value={imageUrl || ""} />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">اسم المنتج</label>
                <div className="relative">
                  <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    name="name"
                    required
                    defaultValue={product?.name || ''}
                    placeholder="مثال: فلاش لؤلؤة العمدة 1 لتر"
                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">كود المنتج (SKU)</label>
                  <div className="relative">
                    <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      name="sku"
                      required
                      defaultValue={product?.sku || ''}
                      placeholder="P-XXXX"
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الفئة</label>
                  <div className="relative">
                    <Layers className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <select 
                      name="category"
                      required
                      defaultValue={product?.category || 'منظفات'}
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black appearance-none"
                    >
                      <option value="منظفات">منظفات</option>
                      <option value="صابون سائل">صابون سائل</option>
                      <option value="صابون قطع">صابون قطع</option>
                      <option value="منتجات ورقية">منتجات ورقية</option>
                      <option value="منتجات إضافية">منتجات إضافية</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#D4AF37] pr-2 uppercase flex items-center gap-1">
                      <Package size={12} />
                      سعة الكرتونة (عدد القطع)
                    </label>
                    <input 
                      name="packagingSize"
                      type="number"
                      required
                      defaultValue={product?.packagingSize || 1}
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-center"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 pr-2 uppercase flex items-center gap-1">
                      الوحدة الصغرى (الأساسية)
                    </label>
                    <input 
                      name="baseUnitName"
                      required
                      defaultValue={product?.baseUnitName || 'قطعة'}
                      placeholder="مثال: قطعة، زجاجة"
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-center"
                    />
                 </div>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-6">
               <h4 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                  <Banknote size={20} className="text-[#D4AF37]" />
                  قائمة الأسعار (ج.م)
               </h4>
               
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Wholesale - Always Shown */}
                  <div className="space-y-2 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100">
                    <label className="text-[10px] font-black text-emerald-600 pr-2 uppercase flex items-center gap-1">
                      <Target size={12} />
                      سعر الجملة
                    </label>
                    <input 
                      name="wholesale"
                      type="number"
                      required
                      defaultValue={Number(product?.prices?.wholesale || 0)}
                      placeholder="0.00"
                      className="w-full bg-white border border-emerald-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 font-black text-center text-lg"
                    />
                  </div>

                  {/* Retail - Always Shown */}
                  <div className="space-y-2 bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
                    <label className="text-[10px] font-black text-purple-600 pr-2 uppercase flex items-center gap-1">
                      <Plus size={12} />
                      سعر القطاعي
                    </label>
                    <input 
                      name="retail"
                      type="number"
                      required
                      defaultValue={Number(product?.prices?.retail || 0)}
                      placeholder="0.00"
                      className="w-full bg-white border border-purple-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500/20 font-black text-center text-lg"
                    />
                  </div>

                  {/* Manufactured Only Prices - Strict Condition */}
                  {productType === 'manufactured' && (
                    <>
                      <div className="space-y-2 bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                        <label className="text-[10px] font-black text-blue-600 pr-2 uppercase flex items-center gap-1">
                          <Users size={12} />
                          سعر الموزع
                        </label>
                        <input 
                          name="distributor"
                          type="number"
                          required={productType === 'manufactured'}
                          defaultValue={Number(product?.prices?.distributor || 0)}
                          placeholder="0.00"
                          className="w-full bg-white border border-blue-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 font-black text-center text-lg"
                        />
                      </div>
                      <div className="space-y-2 bg-amber-50/30 p-4 rounded-2xl border border-amber-100">
                        <label className="text-[10px] font-black text-amber-600 pr-2 uppercase flex items-center gap-1">
                          <Users size={12} />
                          سعر المندوب
                        </label>
                        <input 
                          name="representative"
                          type="number"
                          required={productType === 'manufactured'}
                          defaultValue={Number(product?.prices?.representative || 0)}
                          placeholder="0.00"
                          className="w-full bg-white border border-amber-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 font-black text-center text-lg"
                        />
                      </div>
                    </>
                  )}
               </div>
            </div>

            {/* Industrial Settings (Conditional) */}
            <AnimatePresence mode="wait">
               {productType === 'manufactured' ? (
                  <motion.div 
                     key="manufactured"
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="space-y-6 bg-amber-50/20 p-6 rounded-3xl border border-amber-100/50 overflow-hidden"
                  >
                     <h4 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                        <Target size={20} className="text-amber-500" />
                        المصاريف الصناعية (للعبوة الواحدة)
                     </h4>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-amber-600 pr-2 uppercase">تكلفة التعبئة (عبوة/استيكر)</label>
                           <div className="relative">
                           <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300" size={18} />
                           <input 
                              name="packagingCost"
                              type="number"
                              step="0.01"
                              required={productType === 'manufactured'}
                              defaultValue={Number(product?.costs?.packagingCost || 0)}
                              placeholder="0.00"
                              className="w-full bg-white border border-amber-100 rounded-xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-amber-500/20 font-black"
                           />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-amber-600 pr-2 uppercase">نسبة مصاريف تشغيل %</label>
                           <div className="relative">
                           <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-300" size={18} />
                           <input 
                              name="overheadPercentage"
                              type="number"
                              step="0.1"
                              required={productType === 'manufactured'}
                              defaultValue={Number(product?.costs?.overheadPercentage || 0)}
                              placeholder="0 %"
                              className="w-full bg-white border border-amber-100 rounded-xl py-4 pr-12 pl-6 outline-none focus:ring-2 focus:ring-amber-500/20 font-black"
                           />
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div 
                     key="traded"
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="space-y-6 bg-blue-50/20 p-6 rounded-3xl border border-blue-100/50 overflow-hidden"
                  >
                     <h4 className="text-lg font-black text-gray-800 flex items-center gap-2 px-2">
                        <ShoppingBag size={20} className="text-blue-500" />
                        تكلفة الشراء (للمنتجات الجاهزة)
                     </h4>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-600 pr-2 uppercase flex items-center gap-1">
                           <Banknote size={12} />
                           متوسط التكلفة الحالي المحسوب آلياً (ج.م)
                        </label>
                        <div className="w-full bg-white border border-blue-100 rounded-2xl py-4 px-6 flex items-center justify-center bg-blue-50/30">
                           <span className="text-2xl font-black text-blue-600">
                              {(product?.avgCost || product?.purchaseCost || 0).toLocaleString()} ج.م
                           </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold italic text-center">
                           يتم حساب هذه التكلفة تلقائياً بناءً على فواتير المشتريات لضمان دقة التقارير.
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 shrink-0">
            <button 
              type="submit"
              disabled={isPending}
              className={`w-full ${product ? 'bg-blue-600 shadow-blue-600/20' : 'bg-[#D4AF37] shadow-[#D4AF37]/20'} text-white py-5 rounded-2xl text-xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3`}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={28} />
                  <span>{product ? 'حفظ التعديلات' : 'إضافة المنتج للمخزن'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
