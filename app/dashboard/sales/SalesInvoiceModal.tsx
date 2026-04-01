'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  X, 
  ShoppingCart, 
  User, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Package, 
  TrendingUp,
  Banknote,
  Search,
  Calculator
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSalesInvoice } from '@/app/lib/actions/sales'
import { getCustomers } from '@/app/lib/actions/customers'
import { getProducts } from '@/app/lib/actions/products'

interface SalesInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SalesInvoiceModal({ isOpen, onClose, onSuccess }: SalesInvoiceModalProps) {
  const [isPending, startTransition] = useTransition()
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  const [items, setItems] = useState<any[]>([{ 
    productId: '', 
    qtyCartons: 0, 
    qtyPieces: 0, 
    unitPrice: 0, 
    lineTotal: 0 
  }])
  
  const [amountPaid, setAmountPaid] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('Cash')

  useEffect(() => {
    const fetchData = async () => {
      const custData = await getCustomers()
      const prodData = await getProducts()
      setCustomers(custData)
      setProducts(prodData)
    }
    if (isOpen) {
      fetchData()
      // Reset form state on open
      setSelectedCustomerId('')
      setSelectedCustomer(null)
      setItems([{ productId: '', qtyCartons: 0, qtyPieces: 0, unitPrice: 0, lineTotal: 0 }])
      setAmountPaid(0)
      setPaymentMethod('Cash')
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find(c => c._id === selectedCustomerId)
      setSelectedCustomer(cust)
    }
  }, [selectedCustomerId, customers])

  const getPriceForTier = (product: any, tier: string) => {
    if (!product || !product.prices) return 0;
    switch (tier) {
      case 'جملة': return product.prices.wholesale || 0;
      case 'موزع': return product.prices.distributor || 0;
      case 'مندوب': return product.prices.representative || 0;
      case 'قطاعي':
      default: return product.prices.retail || 0;
    }
  };

  // Sync item prices when customer tier changes
  useEffect(() => {
    if (selectedCustomer && items.length > 0) {
      const updatedItems = items.map(item => {
        if (!item.productId) return item;
        const product = products.find(p => p._id === item.productId);
        if (!product) return item;

        const newPrice = getPriceForTier(product, selectedCustomer.pricingTier);
        const totalPieces = (Number(item.qtyCartons) * product.packagingSize) + Number(item.qtyPieces);
        
        return {
          ...item,
          unitPrice: newPrice,
          lineTotal: totalPieces * newPrice
        };
      });
      setItems(updatedItems);
    }
  }, [selectedCustomer]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', qtyCartons: 0, qtyPieces: 0, unitPrice: 0, lineTotal: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId)
    if (!product) return

    const newItems = [...items]
    newItems[index].productId = productId
    
    // Auto-fill price based on customer tier
    const tier = selectedCustomer?.pricingTier || 'قطاعي';
    const price = getPriceForTier(product, tier);
    
    newItems[index].unitPrice = price
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

  const totalInvoiceAmount = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) return alert("يرجى اختيار العميل")
    if (items.some(i => !i.productId)) return alert("يرجى اختيار مادة لكل بند")

    startTransition(async () => {
      const result = await createSalesInvoice({
        customerId: selectedCustomerId,
        items,
        amountPaid,
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
        className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl p-6 md:p-10 lg:p-12 overflow-hidden flex flex-col max-h-[95vh] border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex gap-4 items-center">
             <div className="h-16 w-16 bg-[#D4AF37] rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-[#D4AF37]/30">
                <ShoppingCart size={32} />
             </div>
             <div>
                <h3 className="text-3xl font-black text-gray-800 tracking-tight">إصدار فاتورة مبيعات</h3>
                <p className="text-gray-400 font-bold italic">قم بإنشاء فاتورة جديدة وتحصيل المبالغ آلياً.</p>
             </div>
          </div>
          <button onClick={onClose} className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-all active:scale-95">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-10 scrollbar-thin scrollbar-thumb-gray-100 pb-8">
            
            {/* Customer Selection & Sales Context */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
               <div className="lg:col-span-1 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">اختيار العميل</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" size={20} />
                    <select 
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all font-black appearance-none"
                    >
                      <option value="">اختر العميل...</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.pricingTier})</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="lg:col-span-1 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 pr-2 uppercase">طريقة الدفع</label>
                  <div className="relative">
                    <Banknote className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl py-4 pr-12 pl-6 outline-none focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] transition-all font-black appearance-none"
                    >
                      <option value="Cash">كاش (نقدي)</option>
                      <option value="Transfer">تحويل بنكي</option>
                      <option value="Check">شيك</option>
                      <option value="Credit">آجل (دين)</option>
                    </select>
                  </div>
               </div>

               <div className="lg:col-span-1 flex items-end gap-3">
                  <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                     <div>
                        <p className="text-[8px] font-black text-gray-400 uppercase">فئة التسعير</p>
                        <p className="font-black text-[#D4AF37]">{selectedCustomer?.pricingTier || "اختر عميلاً"}</p>
                     </div>
                     <TrendingUp className="text-gray-200" size={20} />
                  </div>
               </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-4">
                  <h4 className="text-xl font-black text-gray-800 flex items-center gap-2">
                     <Package size={22} className="text-[#D4AF37]" />
                     بنود الفاتورة
                  </h4>
                  <button 
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-sm hover:bg-emerald-100 transition-all active:scale-95 shadow-sm shadow-emerald-600/5"
                  >
                     <Plus size={18} />
                     <span>إضافة صنف</span>
                  </button>
               </div>

               <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-right border-collapse">
                     <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">الصنف</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-24">كرتونة</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-24">قطعة</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-32">سعر البيع</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-32">الإجمالي</th>
                           <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center w-16"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {items.map((item, idx) => (
                           <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                              <td className="p-4">
                                 <select 
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 font-bold"
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
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 font-black text-center"
                                    value={item.qtyCartons || ''}
                                    onChange={(e) => handleQtyChange(idx, 'qtyCartons', Number(e.target.value))}
                                 />
                              </td>
                              <td className="p-4">
                                 <input 
                                    type="number"
                                    className="w-full bg-gray-50 border-none rounded-xl py-3 px-2 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 font-black text-center"
                                    value={item.qtyPieces || ''}
                                    onChange={(e) => handleQtyChange(idx, 'qtyPieces', Number(e.target.value))}
                                 />
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center bg-gray-50 rounded-xl px-2">
                                    <input 
                                       type="number"
                                       className="w-full bg-transparent border-none py-3 outline-none font-black text-center text-emerald-600"
                                       value={item.unitPrice || ''}
                                       onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                                    />
                                    <span className="text-[8px] font-black text-gray-300">ج.م</span>
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

          {/* Footer - Calculator & Totals */}
          <div className="mt-8 pt-8 border-t border-gray-100 shrink-0">
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-4 justify-center">
                   <div className="flex items-center gap-6">
                      <div className="flex-1 space-y-2">
                         <label className="text-[10px] font-black text-gray-400 pr-2 uppercase flex items-center gap-2">
                            <Banknote size={12} className="text-emerald-500" />
                            المبلغ المحصل حالياً
                         </label>
                         <input 
                           type="number"
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl py-4 px-6 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-black text-2xl text-emerald-600"
                           value={amountPaid || ''}
                           onChange={(e) => setAmountPaid(Number(e.target.value))}
                         />
                      </div>
                      <button 
                         type="button"
                         onClick={() => setAmountPaid(totalInvoiceAmount)}
                         className="h-14 px-4 bg-emerald-50 text-emerald-600 rounded-2xl mt-6 flex items-center justify-center font-black text-xs hover:bg-emerald-100 transition-all active:scale-95"
                      >
                         تصفية الكل
                      </button>
                   </div>
                   <div className="p-4 bg-red-50 rounded-2xl flex items-center justify-between border border-red-100">
                      <span className="text-xs font-black text-red-600">المتبقي للحساب الآجل:</span>
                      <span className="text-lg font-black text-red-700">{(totalInvoiceAmount - amountPaid).toLocaleString()} ج.م</span>
                   </div>
                </div>

                <div className="lg:col-span-2 bg-[#1B1B1C] rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl shadow-black/20">
                   <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">إجمالي الفاتورة</span>
                      <Calculator className="text-[#D4AF37]" size={24} />
                   </div>
                   <div className="flex items-baseline justify-end gap-3 mt-4">
                      <span className="text-5xl font-black text-white">{totalInvoiceAmount.toLocaleString()}</span>
                      <span className="text-xl font-black text-[#D4AF37]">ج.م</span>
                   </div>
                   
                   <button 
                      type="submit"
                      disabled={isPending}
                      className="w-full mt-8 bg-[#D4AF37] text-white py-5 rounded-3xl text-2xl font-black shadow-xl shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {isPending ? (
                       <>
                         <Loader2 className="animate-spin" size={32} />
                         <span>جاري إصدار الفاتورة...</span>
                       </>
                     ) : (
                       <>
                         <CheckCircle2 size={32} />
                         <span>حفظ وإصدار الفاتورة</span>
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
