'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  RotateCcw, 
  Trash2, 
  ShoppingCart, 
  Loader2, 
  Package, 
  Calculator,
  Wallet,
  Banknote,
  Plus,
  CheckCircle2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getSuppliers } from '@/app/lib/actions/suppliers'
import { getRawMaterials, createPurchaseReturn } from '@/app/lib/actions/purchases'

interface PurchaseReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseReturnModal({ isOpen, onClose, onSuccess }: PurchaseReturnModalProps) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [items, setItems] = useState([{ materialId: '', qty: 0, price: 0 }])
  const [amountRefunded, setAmountRefunded] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Check' | 'Transfer' | 'Credit'>('Cash')
  const [isPending, startTransition] = useTransition()
  const [isDataLoading, setIsDataLoading] = useState(true)

  const totalReturnAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0)

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsDataLoading(true)
        const [sData, mData] = await Promise.all([getSuppliers(), getRawMaterials()])
        setSuppliers(sData)
        setMaterials(mData)
        setIsDataLoading(false)
      }
      fetchData()
      setSelectedSupplier('')
      setItems([{ materialId: '', qty: 0, price: 0 }])
      setAmountRefunded(0)
    }
  }, [isOpen])

  const addItem = () => setItems([...items, { materialId: '', qty: 0, price: 0 }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[idx] = { ...newItems[idx], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return alert('الرجاء اختيار المورد')
    if (items.some(item => !item.materialId || item.qty <= 0)) {
      return alert('الرجاء التأكد من صحة بيانات كافة الأصناف')
    }

    startTransition(async () => {
      const result = await createPurchaseReturn({
        supplierId: selectedSupplier,
        items,
        amountRefunded,
        paymentMethod,
        date: new Date()
      })

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
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 overflow-hidden flex flex-col max-h-[95vh] border border-red-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <RotateCcw size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">إصدار مرتجع مشتريات خامات</h3>
              <p className="text-gray-400 font-bold italic">إرجاع خامات للمورد وتسوية الديون.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {isDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-red-600" size={48} />
            <p className="text-gray-400 font-bold italic">جاري جلب البيانات...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
              
              <div className="bg-red-50/30 p-6 rounded-3xl border border-red-100 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-red-600 pr-2 uppercase">المورد</label>
                  <select 
                    required
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-white border border-red-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black appearance-none"
                  >
                    <option value="">اختر المورد...</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.category === 'Raw' ? 'خامات' : 'بضائع'})</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-red-600 pr-2 uppercase">طريقة استرداد المبلغ</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white border border-red-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-black appearance-none"
                  >
                    <option value="Cash">كاش (نقدي)</option>
                    <option value="Check">شيك</option>
                    <option value="Transfer">تحويل بنكي</option>
                    <option value="Credit">خصم من رصيد المورد (آجل)</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <Package size={20} className="text-red-600" />
                      الخامات المرتجعة
                   </h4>
                   <button 
                      type="button"
                      onClick={addItem}
                      className="text-red-600 font-black text-sm flex items-center gap-1 hover:underline"
                   >
                      <Plus size={16} />
                      إضافة خامة أخرى
                   </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-12 gap-4 items-end bg-white border border-red-50 p-4 rounded-2xl shadow-sm group"
                    >
                      <div className="col-span-12 md:col-span-5 space-y-2">
                        <label className="text-[10px] font-black text-red-400 pr-2 uppercase italic">الخامة</label>
                        <select 
                          required
                          value={item.materialId}
                          onChange={(e) => updateItem(idx, 'materialId', e.target.value)}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-sm"
                        >
                          <option value="">اختر الخامة...</option>
                          {materials.map(m => (
                            <option key={m._id} value={m._id}>{m.name} ({m.code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black text-red-400 pr-2 uppercase italic">الكمية</label>
                        <input 
                          type="number"
                          required
                          value={item.qty || ''}
                          onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value))}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-black text-sm"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black text-red-400 pr-2 uppercase italic">سعر المرتجع</label>
                        <input 
                          type="number"
                          required
                          value={item.price || ''}
                          onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                          className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-black text-sm"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 pb-1">
                        <button 
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-red-500 rounded-xl transition-all disabled:opacity-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Banknote size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">المبلغ المسترد نقداً</span>
                    </div>
                    <input 
                      type="number"
                      value={amountRefunded}
                      onChange={(e) => setAmountRefunded(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-emerald-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-black text-2xl text-emerald-600"
                    />
                    <div className="flex items-center justify-between px-2 pt-2">
                      <span className="text-xs font-bold text-gray-500">سيخصم الباقي من مديونيتنا للمورد:</span>
                      <span className="text-sm font-black text-emerald-700">{(totalReturnAmount - amountRefunded).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-950 rounded-[2rem] p-8 flex flex-col justify-between text-white shadow-xl shadow-red-950/20">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-red-400 font-bold uppercase tracking-widest text-sm">إجمالي قيمة المرتجع</span>
                      <Calculator className="text-red-400" size={24} />
                   </div>
                   <div className="flex items-baseline justify-end gap-3 mt-4">
                      <span className="text-5xl font-black text-white">{totalReturnAmount.toLocaleString()}</span>
                      <span className="text-xl font-black text-red-500">ج.م</span>
                   </div>
                   
                   <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full mt-8 bg-red-600 text-white py-5 rounded-2xl text-xl font-black shadow-lg shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                     {isPending ? (
                       <Loader2 className="animate-spin text-white" size={24} />
                     ) : (
                       <>
                         <CheckCircle2 size={24} />
                         <span>تأكيد المرتجع</span>
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
