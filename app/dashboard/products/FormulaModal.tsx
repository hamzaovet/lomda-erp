'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  FlaskConical, 
  Loader2, 
  CheckCircle2, 
  Beaker,
  Scale,
  Banknote
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRawMaterials } from '@/app/lib/actions/purchases'
import { updateProductFormula } from '@/app/lib/actions/production'

interface FormulaModalProps {
  isOpen: boolean
  onClose: () => void
  product: any
  onSuccess: () => void
}

export default function FormulaModal({ isOpen, onClose, product, onSuccess }: FormulaModalProps) {
  const [materials, setMaterials] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<{ materialId: string; qtyPerUnit: number }[]>([])
  const [isPending, startTransition] = useTransition()
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Debug industrial variables received from parent
  useEffect(() => {
    if (isOpen) {
      console.log(`💎 FormulaModal Received Product: ${product?.name}`);
      console.log(`📝 Costs Found:`, product?.costs);
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsDataLoading(true)
        const mData = await getRawMaterials()
        setMaterials(mData)
        
        // Initialize with product formula if it exists
        if (product?.formula?.length > 0) {
          setIngredients(product.formula.map((f: any) => ({
            materialId: f.materialId?._id || f.materialId,
            qtyPerUnit: f.qtyPerUnit
          })))
        } else {
          setIngredients([{ materialId: '', qtyPerUnit: 0 }])
        }
        setIsDataLoading(false)
      }
      fetchData()
    }
  }, [isOpen, product])

  const addIngredient = () => setIngredients([...ingredients, { materialId: '', qtyPerUnit: 0 }])
  const removeIngredient = (idx: number) => setIngredients(ingredients.filter((_, i) => i !== idx))
  
  const updateIngredient = (idx: number, field: string, value: any) => {
    const newIngs = [...ingredients]
    newIngs[idx] = { ...newIngs[idx], [field]: value }
    setIngredients(newIngs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ingredients.some(ing => !ing.materialId || ing.qtyPerUnit <= 0)) {
      return alert('الرجاء التأكد من صحة بيانات كافة المكونات')
    }

    startTransition(async () => {
      const result = await updateProductFormula(product._id, ingredients)
      if (result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error)
      }
    })
  }

  const totalCost = ingredients.reduce((sum, ing) => {
    const mat = materials.find(m => m._id === ing.materialId)
    return sum + (ing.qtyPerUnit * (mat?.avgCost || 0))
  }, 0)

  // Industrial Costing Vars (Defensive)
  const pkgCost = product?.costs?.packagingCost || 0;
  const overheadPct = product?.costs?.overheadPercentage || 0;
  const finalIndustrialCost = (totalCost + pkgCost) * (1 + overheadPct / 100);

  if (!isOpen || !product) return null

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20">
              <FlaskConical size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">تعديل الروشتة التصنيعية</h3>
              <p className="text-gray-400 font-bold italic">تحديد المكونات المطلوبة لإنتاج: {product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {isDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
            <p className="text-gray-400 font-bold italic">جاري تحميل قائمة الخامات...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-gray-100">
              <div className="px-2 pb-2">
                 <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Beaker size={16} className="text-[#D4AF37]" />
                    المكونات المطلوبة (لكل وحدة منتج)
                 </h4>
              </div>

              <div className="space-y-4">
                {ingredients.map((ing, idx) => (
                  <motion.div 
                    key={idx}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-12 gap-4 items-end bg-gray-50/50 p-4 rounded-2xl border border-gray-100 group"
                  >
                    <div className="col-span-12 md:col-span-7 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الخامة</label>
                      <select 
                        required
                        value={ing.materialId}
                        onChange={(e) => updateIngredient(idx, 'materialId', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-sm appearance-none"
                      >
                        <option value="">اختر الخامة...</option>
                        {materials.map(m => (
                          <option key={m._id} value={m._id}>{m.name} ({m.code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-10 md:col-span-4 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">الكمية لكل وحدة</label>
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.001"
                          required
                          value={ing.qtyPerUnit ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            updateIngredient(idx, 'qtyPerUnit', isNaN(val) ? 0 : val);
                          }}
                          placeholder="0.00"
                          className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-sm pr-12"
                        />
                        <Scale size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-1">
                      <button 
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        disabled={ingredients.length === 1}
                        className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button 
                type="button"
                onClick={addIngredient}
                className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>إضافة مادة خام للتركيبة</span>
              </button>
            </div>

            {/* Footer Summary */}
            <div className="mt-8 pt-6 border-t border-gray-100 shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                {/* Live Cost Preview Breakdown */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-4 bg-[#D4AF37]/5 px-6 py-4 rounded-2xl border border-[#D4AF37]/10">
                     <div className="h-10 w-10 bg-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Banknote size={20} />
                     </div>
                     <div className="flex flex-col min-w-[200px]">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">التكلفة الصناعية النهائية</span>
                        <span className="text-xl font-black text-gray-800 tabular-nums">
                          {finalIndustrialCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} ج.م
                        </span>
                     </div>
                  </div>
                  
                  {/* Detailed Breakdown Badge */}
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-400 gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">خامات:</span>
                      <span className="text-gray-600">{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
                      <span className="text-gray-300">تعبئة:</span>
                      <span className="text-gray-600">{pkgCost}</span>
                    </div>
                    <div className="flex items-center gap-1 border-r border-gray-200 pr-4">
                      <span className="text-gray-300">تشغيل:</span>
                      <span className="text-gray-600">%{overheadPct}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 w-full md:w-auto">
                   <button 
                      type="button"
                      onClick={onClose}
                      className="px-8 py-4 rounded-2xl font-black text-gray-400 hover:bg-gray-50 transition-all"
                   >
                      إلغاء
                   </button>
                   <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full md:w-auto px-12 py-4 rounded-2xl bg-[#D4AF37] text-white font-black shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[200px]"
                   >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={24} />
                          <span>حفظ التركيبة</span>
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
