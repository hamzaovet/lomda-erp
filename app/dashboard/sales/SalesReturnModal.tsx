'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  RotateCcw, // Icon for return
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Package, 
  Banknote,
  Calculator
} from 'lucide-react'
import { motion } from 'framer-motion'
import { createSalesReturn } from '@/app/lib/actions/sales'
import { getCustomers } from '@/app/lib/actions/customers'
import { getProducts } from '@/app/lib/actions/products'

interface SalesReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SalesReturnModal({ isOpen, onClose, onSuccess }: SalesReturnModalProps) {
  const [isPending, startTransition] = useTransition()
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  
  const [items, setItems] = useState<any[]>([{ 
    productId: '', 
    qtyCartons: 0, 
    qtyPieces: 0, 
    unitPrice: 0, 
    lineTotal: 0 
  }])
  
  const [amountRefunded, setAmountRefunded] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  useEffect(() => {
    const fetchData = async () => {
      const [custData, prodData] = await Promise.all([getCustomers(), getProducts()])
      setCustomers(custData)
      setProducts(prodData)
    }
    if (isOpen) {
      fetchData()
      setSelectedCustomerId('')
      setItems([{ productId: '', qtyCartons: 0, qtyPieces: 0, unitPrice: 0, lineTotal: 0 }])
      setAmountRefunded(0)
      setPaymentMethod('Cash')
    }
  }, [isOpen])

  const handleAddItem = () => {
    setItems([...items, { productId: '', qtyCartons: 0, qtyPieces: 0, unitPrice: 0, lineTotal: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId)
    if (!product) return

    const newItems = [...items]
    newItems[index].productId = productId
    // For returns, we might want to default to retail or let them type it
    newItems[index].unitPrice = product.prices?.retail || 0
    updateLineTotal(index, newItems)
    setItems(newItems)
  }

  const updateLineTotal = (index: number, currentItems: any[]) => {
    const item = currentItems[index]
    const product = products.find(p => p._id === item.productId)
    if (!product) return

    const totalPieces = (Number(item.qtyCartons) * product.packagingSize) + Number(item.qtyPieces)
    item.lineTotal = totalPieces * item.unitPrice
  }

  const handleQtyChange = (index: number, field: string, value: number) => {
    const newItems = [...items]
    newItems[index][field] = value
    updateLineTotal(index, newItems)
    setItems(newItems)
  }

  const handlePriceChange = (index: number, value: number) => {
    const newItems = [...items]
    newItems[index].unitPrice = value
    updateLineTotal(index, newItems)
    setItems(newItems)
  }

  const totalReturnAmount = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) return alert("يرجى اختيار العميل")
    if (items.some(i => !i.productId)) return alert("يرجى اختيار منتج لكل بند")

    startTransition(async () => {
      const result = await createSalesReturn({
        customerId: selectedCustomerId,
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl p-6 md:p-10 lg:p-12 overflow-hidden flex flex-col max-h-[95vh] border border-red-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex gap-4 items-center">
             <div className="h-16 w-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-red-600/30">
                <RotateCcw size={32} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">إصدار مرتجع مبيعات</h3>
                <p className="text-gray-400 font-bold italic">استلام بضاعة مرتجعة وتسوية حساب العميل.</p>
             </div>
          </div>
          <button onClick={onClose} className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-95">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-10 scrollbar-thin scrollbar-thumb-gray-100 pb-8">
            
            {/* Customer Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-red-50/30 rounded-[2.5rem] border border-red-100">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase text-red-600">اختيار العميل</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" size={20} />
                    <select 
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-red-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black appearance-none"
                    >
                      <option value="">اختر العميل...</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.pricingTier})</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase text-red-600">طريقة رد المبلغ</label>
                  <div className="relative">
                    <Banknote className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-red-100 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black appearance-none"
                    >
                      <option value="Cash">كاش (نقدي)</option>
                      <option value="Transfer">تحويل بنكي</option>
                      <option value="Check">شيك</option>
                      <option value="Credit">خصم من الرصيد (آجل)</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                     <Package size={22} className="text-red-500" />
                     الأصناف المرتجعة
                  </h4>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 rounded-full font-black text-sm hover:bg-red-100 transition-all active:scale-95 shadow-sm shadow-red-600/5"
                  >
                     <Plus size={18} />
                     <span>إضافة صنف مرتجع</span>
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-right border-collapse">
                     <thead>
                        <tr className="bg-red-50/20 border-b border-red-50">
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">الصنف</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-24">كرتونة</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-24">قطعة</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-32">سعر المرتجع</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-32">الإجمالي</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-16"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                           <tr key={idx} className="hover:bg-red-50/10 transition-colors">
                              <td className="p-4">
                                 <select 
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/20 font-bold"
                                    value={item.productId}
                                    onChange={(e) => handleProductChange(idx, e.target.value)}
                                 >
                                    <option value="">اختر المنتج...</option>
                                    {products.map(p => (
                                       <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                                    ))}
                                 </select>
                              </td>
                              <td className="p-4">
                                 <input 
                                    type="number"
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-2 outline-none focus:ring-2 focus:ring-red-500/20 font-black text-center"
                                    value={item.qtyCartons || ''}
                                    onChange={(e) => handleQtyChange(idx, 'qtyCartons', Number(e.target.value))}
                                 />
                              </td>
                              <td className="p-4">
                                 <input 
                                    type="number"
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-2 outline-none focus:ring-2 focus:ring-red-500/20 font-black text-center"
                                    value={item.qtyPieces || ''}
                                    onChange={(e) => handleQtyChange(idx, 'qtyPieces', Number(e.target.value))}
                                 />
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center bg-gray-50 rounded-xl px-2">
                                    <input 
                                       type="number"
                                       className="w-full bg-transparent border-none py-3 outline-none font-black text-center text-red-600"
                                       value={item.unitPrice || ''}
                                       onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                    />
                                 </div>
                              </td>
                              <td className="p-4 text-center">
                                 <span className="font-black text-gray-800">{(item.lineTotal || 0).toLocaleString()}</span>
                              </td>
                              <td className="p-4">
                                 <button 
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 shrink-0">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4 justify-center">
                   <div className="flex items-center gap-6">
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black text-gray-400 pr-2 uppercase flex items-center gap-2">
                            <Banknote size={12} className="text-emerald-500" />
                            المبلغ المردود نقداً (إن وجد)
                         </label>
                         <input 
                           type="number"
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-black text-2xl text-emerald-600"
                           value={amountRefunded || ''}
                           onChange={(e) => setAmountRefunded(Number(e.target.value))}
                         />
                      </div>
                   </div>
                   <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
                      <span className="text-xs font-black text-emerald-600">سيتم خصم الباقي من مديونية العميل:</span>
                      <span className="text-lg font-black text-emerald-700">{(totalReturnAmount - amountRefunded).toLocaleString()} ج.م</span>
                   </div>
                </div>

                <div className="lg:col-span-2 bg-red-950 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl shadow-red-950/20">
                   <div className="flex items-center justify-between">
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
                      className="w-full mt-8 bg-red-600 text-white py-5 rounded-3xl text-2xl font-black shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {isPending ? (
                       <>
                         <Loader2 className="animate-spin" size={32} />
                         <span>جاري تسجيل المرتجع...</span>
                       </>
                     ) : (
                       <>
                         <CheckCircle2 size={32} />
                         <span>حفظ المرتجع وعكس الحسابات</span>
                       </>
                     )}
                   </button>
                </div>
             </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
