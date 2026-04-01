'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Package,
  Calculator,
  Calendar,
  Wallet,
  CreditCard,
  Banknote
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSuppliers } from '@/app/lib/actions/suppliers'
import { getRawMaterials, addPurchaseInvoice } from '@/app/lib/actions/purchases'
import { getTradedProducts } from '@/app/lib/actions/products'

interface PurchaseInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PurchaseInvoiceModal({ isOpen, onClose, onSuccess }: PurchaseInvoiceModalProps) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [items, setItems] = useState([{ itemId: '', qty: 0, price: 0, itemType: 'RawMaterial' as 'RawMaterial' | 'Product' }])
  const [amountPaid, setAmountPaid] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Check' | 'Transfer'>('Cash')
  const [dueDate, setDueDate] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Total Calculation
  const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0)
  const remainingBalance = totalAmount - amountPaid

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsDataLoading(true)
        try {
          const [sData, mData, pData] = await Promise.all([
            getSuppliers(), 
            getRawMaterials(),
            getTradedProducts()
          ])
          setSuppliers(sData)
          setMaterials(mData)
          setProducts(pData)
        } catch (error) {
          console.error("Error fetching modal data:", error)
        } finally {
          setIsDataLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen])

  // Sync amountPaid with totalAmount when items change (UX: default to fully paid)
  useEffect(() => {
    setAmountPaid(totalAmount)
  }, [totalAmount])

  const addItem = () => setItems([...items, { itemId: '', qty: 0, price: 0, itemType: 'RawMaterial' }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items] as any
    if (field === 'itemId') {
      // Determine type from combined list implicitly or find in specific arrays
      const isMaterial = materials.some(m => m._id === value)
      newItems[idx] = { 
        ...newItems[idx], 
        itemId: value, 
        itemType: isMaterial ? 'RawMaterial' : 'Product' 
      }
    } else {
      newItems[idx] = { ...newItems[idx], [field]: value }
    }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return alert('الرجاء اختيار المورد')
    if (items.some(item => !item.itemId || item.qty <= 0 || item.price <= 0)) {
      return alert('الرجاء التأكد من صحة بيانات كافة الأصناف')
    }

    startTransition(async () => {
      const result = await addPurchaseInvoice({
        supplierId: selectedSupplier,
        items: items as any, // Mapped to { itemId, qty, price, itemType }
        amountPaid,
        paymentMethod,
        dueDate: (remainingBalance > 0 || paymentMethod === 'Check') ? dueDate : undefined
      })

      if (result.success) {
        onSuccess()
        onClose()
        setItems([{ itemId: '', qty: 0, price: 0, itemType: 'RawMaterial' }])
        setSelectedSupplier('')
        setAmountPaid(0)
        setPaymentMethod('Cash')
        setDueDate('')
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
        className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-[#D4AF37] rounded-3xl flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20">
              <ShoppingCart size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-800">فاتورة مشتريات (خامات / بضائع جاهزة)</h3>
              <p className="text-gray-400 font-bold italic">إشراف كامل على توريد الخامات والمنتجات المتاحة للبيع.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {isDataLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
            <p className="text-gray-400 font-bold italic">جاري جلب البيانات...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-100">
              {/* Supplier Selection */}
              <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic tracking-widest">المورد</label>
                  <select 
                    required
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black appearance-none text-right"
                    dir="rtl"
                  >
                    <option value="">اختر المورد...</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.category === 'Raw' ? 'خامات' : 'بضائع'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
                      <Package size={20} className="text-[#D4AF37]" />
                      الأصناف والكميات المطلوبة
                   </h4>
                   <button 
                      type="button"
                      onClick={addItem}
                      className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl font-black text-xs flex items-center gap-2 hover:bg-[#D4AF37]/20 transition-all"
                   >
                      <Plus size={16} />
                      إضافة صنف
                   </button>
                </div>

                <div className="space-y-4">
                   {items.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-12 gap-4 items-end bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="col-span-12 md:col-span-5 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic">الصنف (خامة أو منتج جاهز)</label>
                        <select 
                          required
                          value={item.itemId}
                          onChange={(e) => updateItem(idx, 'itemId', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-sm appearance-none text-right"
                          dir="rtl"
                        >
                          <option value="">اختر الصنف من القائمة...</option>
                          
                          {materials.length > 0 && (
                            <optgroup label="🧪 الخامات (Raw Materials)">
                              {materials.map(m => (
                                <option key={m._id} value={m._id}>
                                  🧪 خامة: {m.name}
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {products.length > 0 && (
                            <optgroup label="🛍️ المنتجات الجاهزة (Traded Goods)">
                              {products.map(p => (
                                <option key={p._id} value={p._id}>
                                  🛍️ منتج جاهز: {p.name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic">الكمية</label>
                        <input 
                          type="number"
                          required
                          step="0.01"
                          value={item.qty || ''}
                          onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value))}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-sm text-center"
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black text-gray-400 pr-2 uppercase italic">سعر الوحدة</label>
                        <input 
                          type="number"
                          required
                          step="0.01"
                          value={item.price || ''}
                          onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))}
                          placeholder="0.00"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-black text-sm text-center"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 pb-1 flex justify-center">
                        <button 
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="h-10 w-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Payment Overhaul */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#1D1D1F] p-8 rounded-[2rem] text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Wallet size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">تفاصيل الدفع</span>
                  </div>
                  
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-gray-500 pr-2">المبلغ المدفوع</label>
                    <div className="relative">
                       <input 
                        type="number"
                        required
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37] transition-all font-black text-xl text-center"
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-bold">ج.م</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400">
                    <CreditCard size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">طريقة السداد</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 pr-2">الوسيلة</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-black text-sm appearance-none text-right"
                      dir="rtl"
                    >
                      <option value="Cash" className="bg-[#1D1D1F]">نقدياً (كاش)</option>
                      <option value="Check" className="bg-[#1D1D1F]">شيك بنكي</option>
                      <option value="Transfer" className="bg-[#1D1D1F]">تحويل بنكي</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <Calculator size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">المتبقي (مديونية)</span>
                  </div>
                  
                  <div className={`w-full bg-black/40 border ${remainingBalance > 0 ? 'border-red-500/50' : 'border-emerald-500/50'} rounded-2xl py-4 px-6 flex items-center justify-center`}>
                    <p className={`text-2xl font-black ${remainingBalance > 0 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                      {remainingBalance.toLocaleString()} ج.م
                    </p>
                  </div>
                  {remainingBalance < 0 && <p className="text-[10px] text-red-400 text-center font-bold">المستلم أكثر من الإجمالي!</p>}
                </div>
              </div>

              {/* Conditional Due Date */}
              <AnimatePresence>
                {(remainingBalance > 0 || paymentMethod === 'Check') && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex items-center gap-6"
                  >
                    <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="text-sm font-black text-amber-700">تاريخ الاستحقاق (Due Date)</label>
                       <p className="text-xs text-amber-600/70 font-bold italic mb-2">مطلوب لمتابعة سداد الشيك أو المديونية المتبقية.</p>
                       <input 
                         type="date"
                         required
                         value={dueDate}
                         onChange={(e) => setDueDate(e.target.value)}
                         className="w-full bg-white border border-amber-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-black text-sm"
                       />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Summary */}
            <div className="mt-8 pt-6 border-t border-gray-100 shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 shadow-sm">
                   <div className="p-2 bg-white rounded-lg text-gray-400">
                      <Banknote size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الفاتورة</p>
                      <p className="text-2xl font-black text-gray-800">{totalAmount.toLocaleString()} ج.م</p>
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
                      disabled={isPending || remainingBalance < 0}
                      className="flex-1 md:flex-none px-12 py-4 rounded-2xl bg-[#D4AF37] text-white font-black shadow-xl shadow-[#D4AF37]/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[220px]"
                   >
                      {isPending ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={24} />
                          <span>تأكيد وتسجيل العملية</span>
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
