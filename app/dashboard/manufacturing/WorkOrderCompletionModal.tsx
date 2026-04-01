'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  Trash2,
  Package,
  Calculator,
  ArrowRightLeft,
  Scale
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { completeWorkOrder } from '@/app/lib/actions/production'

interface WorkOrderCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  order: any
}

export default function WorkOrderCompletionModal({ isOpen, onClose, onSuccess, order }: WorkOrderCompletionModalProps) {
  const [isPending, startTransition] = useTransition()
  
  // Form State
  const [actualYield, setActualYield] = useState<number>(0)
  const [normalSpoilage, setNormalSpoilage] = useState<number>(0)
  
  if (!isOpen || !order) return null

  const targetQty = Number(order.outputProduct?.qty || 0)
  const abnormalSpoilage = Math.max(0, targetQty - actualYield - normalSpoilage)
  const isBalanceValid = (actualYield + normalSpoilage + abnormalSpoilage) === targetQty && actualYield >= 0 && normalSpoilage >= 0

  // Preview Math (Estimate)
  const product = order.outputProduct?.productId
  const currentUnitCost = Number(product?.costs?.manufacturing || 0);
  const totalBatchCostEstimate = currentUnitCost * targetQty;
  
  const baseUnitCostEstimate = totalBatchCostEstimate / targetQty;
  const abnormalLossEstimate = abnormalSpoilage * baseUnitCostEstimate;
  const goodUnitsCostPool = totalBatchCostEstimate - abnormalLossEstimate;
  const newUnitCostEstimate = actualYield > 0 ? (goodUnitsCostPool / actualYield) : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isBalanceValid) return

    const formData = new FormData()
    formData.append('orderId', order._id)
    formData.append('actualYield', actualYield.toString())
    formData.append('normalSpoilage', normalSpoilage.toString())
    formData.append('abnormalSpoilage', abnormalSpoilage.toString())

    startTransition(async () => {
      const result = await completeWorkOrder(formData)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
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
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight">تسليم الإنتاج الفعلي</h3>
              <p className="text-gray-400 font-bold italic text-sm">أمر تشغيل رقم: {order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
                   <Package size={12} />
                   الإنتاج السليم (الفعلي)
                </label>
                <input 
                   type="number"
                   required
                   value={actualYield}
                   onChange={(e) => setActualYield(Number(e.target.value))}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-2xl text-emerald-600"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 pr-2 uppercase tracking-widest flex items-center gap-2">
                   <Scale size={12} />
                   تالف طبيعي (مسموح به)
                </label>
                <input 
                   type="number"
                   required
                   value={normalSpoilage}
                   onChange={(e) => setNormalSpoilage(Number(e.target.value))}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-black text-2xl text-amber-600"
                />
             </div>
          </div>

          {/* Auto-Calculated Stats */}
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-4">
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold">إجمالي الكمية المستهدفة:</span>
                <span className="font-black text-gray-800">{targetQty} {product?.baseUnitName}</span>
             </div>
             <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-bold">تالف غير طبيعي (خسارة):</span>
                <span className={`font-black ${abnormalSpoilage > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                   {abnormalSpoilage} {product?.baseUnitName}
                </span>
             </div>
             {!isBalanceValid && actualYield + normalSpoilage > targetQty && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 italic">
                   <AlertCircle size={14} />
                   <span>مجموع الكميات يتجاوز الكمية المستهدفة!</span>
                </div>
             )}
          </div>

          {/* Financial Preview (CMA Style) */}
          <div className="bg-emerald-950/5 rounded-3xl p-8 border border-emerald-900/10 relative overflow-hidden group">
             <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-emerald-500 to-transparent" />
             <h4 className="text-emerald-900 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calculator size={14} />
                معاينة الأثر المالي (تقديري)
             </h4>

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-gray-400 font-bold text-[10px] uppercase">تكلفة الوحدة بعد الامتصاص</p>
                   <p suppressHydrationWarning className="text-3xl font-black text-emerald-700 tracking-tighter">
                      {newUnitCostEstimate.toLocaleString('ar-EG', { numberingSystem: 'latn' })} 
                      <span className="text-xs mr-2 font-bold opacity-50">ج.م</span>
                   </p>
                   <p className="text-[8px] text-emerald-500/60 font-medium italic">
                      + {((newUnitCostEstimate / currentUnitCost - 1) * 100 || 0).toFixed(1)}% زيادة بسبب التالف
                   </p>
                </div>

                <div className="space-y-1">
                   <p className="text-gray-400 font-bold text-[10px] uppercase">قيمة خسائر التالف غير الطبيعي</p>
                   <p suppressHydrationWarning className="text-3xl font-black text-red-600 tracking-tighter">
                      {abnormalLossEstimate.toLocaleString('ar-EG', { numberingSystem: 'latn' })}
                      <span className="text-xs mr-2 font-bold opacity-50">ج.م</span>
                   </p>
                   <p className="text-[8px] text-red-400/60 font-medium italic">
                      تخصم من الأرباح ولا تضاف للتكلفة
                   </p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
             <button 
                type="submit"
                disabled={isPending || !isBalanceValid}
                className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl text-xl font-black shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
             >
                {isPending ? (
                   <>
                      <Loader2 className="animate-spin" size={24} />
                      <span>جاري الحساب والإضافة للمخزن...</span>
                   </>
                ) : (
                   <>
                      <CheckCircle2 size={24} />
                      <span>اعتماد وتسليم Batch الإنتاج</span>
                   </>
                )}
             </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
