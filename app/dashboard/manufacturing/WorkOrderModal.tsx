'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  Plus, 
  Settings, 
  Loader2, 
  CheckCircle2,
  Package,
  AlertCircle,
  FlaskConical,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getActiveProducts, createWorkOrder } from '@/app/lib/actions/production'
import { getRawMaterials } from '@/app/lib/actions/purchases'

interface WorkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function WorkOrderModal({ isOpen, onClose, onSuccess }: WorkOrderModalProps) {
  const [products, setProducts] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [qty, setQty] = useState<number>(0)
  const [isPending, startTransition] = useTransition()
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsDataLoading(true)
        const [pData, mData] = await Promise.all([getActiveProducts(), getRawMaterials()])
        setProducts(pData)
        setMaterials(mData)
        setIsDataLoading(false)
      }
      fetchData()
    }
  }, [isOpen])

  const calculateRequiredMaterials = () => {
    if (!selectedProduct || !qty) return []
    return selectedProduct.formula.map((f: any) => {
      const totalRequired = f.qtyPerUnit * qty
      const available = materials.find(m => m._id === f.materialId?._id || m._id === f.materialId)?.stockQty || 0
      return {
        name: f.materialId?.name || 'مادة غير معروفة',
        required: totalRequired,
        available,
        isEnough: available >= totalRequired,
        unit: f.materialId?.unit || 'وحدة'
      }
    })
  }

  const requirements = calculateRequiredMaterials()
  const canProduce = requirements.length > 0 && requirements.every((r: any) => r.isEnough)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !qty) return alert('الرجاء اختيار المنتج والكمية')
    if (!canProduce) return alert('المواد الخام غير كافية لبدء عملية الإنتاج')

    startTransition(async () => {
      const result = await createWorkOrder({
        productId: selectedProduct._id,
        qty
      })

      if (result.success) {
        onSuccess()
        onClose()
        setSelectedProduct(null)
        setQty(0)
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
        className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Settings size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">بدء أمر تشغيل جديد (Batch Production)</h3>
              <p className="text-gray-400 font-bold italic">تحويل الخامات إلى منتجات نهائية جاهزة للبيع.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {isDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-400 font-bold italic">جاري تحميل قوائم المنتجات والتركيبات...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
              {/* Product and Quantity Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic tracking-widest">المنتج المستهدف</label>
                  <select 
                    required
                    value={selectedProduct?._id || ''}
                    onChange={(e) => {
                      const prod = products.find(p => p._id === e.target.value)
                      setSelectedProduct(prod)
                    }}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-gray-800 appearance-none"
                  >
                    <option value="">اختر المنتج للتصنيع...</option>
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic tracking-widest">الكمية المستهدفة (وحدة)</label>
                  <input 
                    type="number"
                    required
                    value={qty || ''}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                    placeholder="مثال: 500 كرتونة"
                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-black text-gray-800 text-center"
                  />
                </div>
              </div>

              {/* Recipe Verification / Real-time availability check */}
              {selectedProduct && qty > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between px-2">
                     <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
                        <FlaskConical size={20} className="text-blue-500" />
                        التحقق من توافر الخامات (Recipe Check)
                     </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requirements.map((req, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border ${req.isEnough ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} flex items-center justify-between`}>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{req.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${req.isEnough ? 'text-emerald-700' : 'text-red-700'}`}>{req.required}</span>
                            <span className="text-[10px] font-bold text-gray-500">مطلوب ({req.unit})</span>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase text-gray-400 mb-1">المتوفر بالمخزن</p>
                           <p className={`text-sm font-black ${req.isEnough ? 'text-emerald-700' : 'text-red-700 underline underline-offset-4'}`}>
                             {req.available} {req.unit}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!canProduce && (
                    <div className="bg-red-500 text-white p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                        <AlertCircle size={24} />
                        <span className="font-black text-sm">عفواً، لا توجد مواد خام كافية لبدء هذه الكمية من الإنتاج.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="mt-8 pt-6 border-t border-gray-100 shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100">
                   <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                      <TrendingUp size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تأثير التصنيع</p>
                      <p className="text-sm font-bold text-gray-600 italic">سيتم حجز الخامات المطلوبة فور البدء.</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button 
                      type="button"
                      onClick={onClose}
                      className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all"
                   >
                      إلغاء
                   </button>
                   <button 
                      type="submit"
                      disabled={isPending || !canProduce}
                      className="flex-1 md:flex-none px-12 py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[220px] disabled:opacity-50 disabled:grayscale"
                   >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>جاري البدء...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={24} />
                          <span>بدء التصنيع الآن</span>
                        </>
                      )}
                   </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
