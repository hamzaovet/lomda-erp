'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Beaker, 
  Settings, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Download,
  Loader2,
  Check,
  Layers,
  History
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getRawMaterials, getRawMaterialValue } from '@/app/lib/actions/purchases'
import { getWorkOrders } from '@/app/lib/actions/production'
import MaterialModal from './MaterialModal'
import WorkOrderModal from './WorkOrderModal'
import WorkOrderCompletionModal from './WorkOrderCompletionModal'

export default function ManufacturingPage() {
  const [rawMaterials, setRawMaterials] = useState<any[]>([])
  const [rawMaterialValue, setRawMaterialValue] = useState<number>(0)
  const [workOrders, setWorkOrders] = useState<any[]>([])
  
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'manufacturing' | 'inventory'>('manufacturing')
  
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  
  const [manufacturingTab, setManufacturingTab] = useState<'active' | 'completed'>('active')
  
  const [isPending, startTransition] = useTransition()

  const fetchMaterials = async () => {
    setIsLoadingMaterials(true)
    const [data, value] = await Promise.all([getRawMaterials(), getRawMaterialValue()])
    setRawMaterials(data)
    setRawMaterialValue(value)
    setIsLoadingMaterials(false)
  }

  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    const data = await getWorkOrders()
    setWorkOrders(data)
    setIsLoadingOrders(false)
  }

  useEffect(() => {
    fetchMaterials()
    fetchOrders()
  }, [])

  const handleOpenCompletionModal = (order: any) => {
    setSelectedOrder(order)
    setIsCompletionModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-10 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-800">لوحة التصنيع والإنتاج</h1>
          <p className="text-gray-500 font-bold italic mt-1">إشراف كامل على دورة الإنتاج، مخزون الخامات، وتكاليف التشغيل.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMaterialModalOpen(true)}
            className="flex items-center gap-2 bg-white text-gray-800 border-2 border-gray-100 px-6 py-3 rounded-2xl font-black hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
          >
            <Plus size={20} />
            <span>إضافة خامة جديدة</span>
          </button>
          
          <button 
            onClick={() => setIsWorkOrderModalOpen(true)}
            className={`flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all`}
          >
            <Plus size={24} />
            <span>بدء تشغيل جديد</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-gray-100 w-fit shadow-sm print:hidden">
        <button
          onClick={() => setActiveTab('manufacturing')}
          className={`px-8 py-3 rounded-[1.5rem] font-black transition-all ${
            activeTab === 'manufacturing' 
              ? 'bg-[#1D1D1F] text-[#D4AF37] shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          لوحة التصنيع والإنتاج
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-8 py-3 rounded-[1.5rem] font-black transition-all ${
            activeTab === 'inventory' 
              ? 'bg-[#1D1D1F] text-[#D4AF37] shadow-lg' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          تقرير جرد الخامات
        </button>
      </div>


      {activeTab === 'manufacturing' && (
        <>
          {/* Stats Grid - Manufacturing */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
            {[
              { label: "إجمالي أنواع الخامات", value: `${rawMaterials.length} صنف`, icon: Beaker, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5" },
              { label: "قيمة مخزن الخامات", value: `${rawMaterialValue.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م`, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "أصناف بحاجة لطلب", value: `${rawMaterials.filter(m => m.stockQty < m.minLevel).length} صنف`, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
              { label: "أوامر نشطة حالياً", value: `${workOrders.filter(o => o.status === 'pending').length} تشغيل`, icon: Settings, color: "text-blue-500", bg: "bg-blue-50" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                    <stat.icon size={28} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 font-bold text-sm mb-1">{stat.label}</p>
                  <p suppressHydrationWarning className={`text-2xl font-black ${stat.color === 'text-red-500' ? 'text-red-600' : stat.color === 'text-blue-500' ? 'text-blue-600' : 'text-gray-800'}`}>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section 1: Raw Materials Inventory */}
          <div className="space-y-6 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-1.5 rounded-full bg-[#D4AF37]" />
                <h2 className="text-2xl font-black text-gray-800">مخزن الخامات الأساسية</h2>
              </div>
            </div>

            {isLoadingMaterials ? (
              <div className="bg-white rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100">
                <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
                <p className="text-gray-400 font-bold italic">جاري تحميل بيانات المخزن...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-sm font-black text-gray-400">كود الخامة</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400">اسم الخامة</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الكمية المتاحة</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">التكلفة (متوسط)</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 uppercase">
                      {rawMaterials.map((item) => {
                        const isLow = item.stockQty < item.minLevel;
                        return (
                          <tr key={item._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-5 font-bold text-gray-400">{item.code}</td>
                            <td className="px-8 py-5">
                              <span className="font-black text-gray-800">{item.name}</span>
                            </td>
                            <td className={`px-8 py-5 font-black flex items-center gap-2 ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                              {item.stockQty} {item.unit}
                              {isLow && <AlertCircle size={14} className="text-red-500" />}
                            </td>
                            <td suppressHydrationWarning className="px-8 py-5 text-center font-bold text-emerald-600">
                              {item.avgCost.toFixed(2)} ج.م
                            </td>
                            <td className="px-8 py-5 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black inline-block whitespace-nowrap ${
                                isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {isLow ? 'نواقص' : 'آمن'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Manufacturing Work Orders */}
          <div className="space-y-6 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-1.5 rounded-full bg-blue-500" />
                  <h2 className="text-2xl font-black text-gray-800">خطة وجدولة الإنتاج</h2>
                </div>
                
                {/* Manufacturing Sub-Tabs */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                   <button 
                      onClick={() => setManufacturingTab('active')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                         manufacturingTab === 'active' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                      }`}
                   >
                      الأوامر النشطة
                   </button>
                   <button 
                      onClick={() => setManufacturingTab('completed')}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                         manufacturingTab === 'completed' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400 hover:text-gray-600'
                      }`}
                   >
                      سجل المكتمل
                   </button>
                </div>
              </div>
            </div>

            {isLoadingOrders ? (
              <div className="bg-white rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100">
                 <Loader2 className="animate-spin text-blue-600" size={48} />
                 <p className="text-gray-400 font-bold italic">جاري جلب خطة الإنتاج...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">رقم الأمر</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400">المنتج المستهدف</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الكمية المطلوبة</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">تاريخ البدء</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400">الحالة</th>
                        <th className="px-8 py-5 text-sm font-black text-gray-400 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 uppercase">
                      {workOrders
                        .filter(o => manufacturingTab === 'active' ? o.status === 'pending' : o.status === 'completed')
                        .map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-center">
                            <span className="bg-gray-100 px-3 py-1 rounded-lg font-bold text-gray-500 text-xs">{order.orderNumber}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-black text-gray-800">{order.outputProduct?.productId?.name || 'منتج غير معروف'}</span>
                          </td>
                          <td className="px-8 py-5 text-center font-bold text-gray-800">{order.outputProduct?.qty} وحدة</td>
                          <td className="px-8 py-5 text-center font-bold text-gray-400 text-xs italic">
                            {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-8 py-5">
                            {manufacturingTab === 'active' ? (
                               <div className="px-4 py-1.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-black inline-flex items-center gap-2">
                                  <Clock size={12} />
                                  قيد التنفيذ
                               </div>
                            ) : (
                               <div className="flex flex-col gap-1">
                                  <div className="px-4 py-1.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-black inline-flex items-center gap-2 justify-center">
                                     <CheckCircle2 size={12} />
                                     إنتاج مكتمل
                                  </div>
                                  <span className="text-[9px] font-bold text-gray-400 text-center italic">صافي: {order.actualYield} سليم</span>
                               </div>
                            )}
                          </td>
                          <td className="px-8 py-5 text-center">
                            {order.status === 'pending' ? (
                              <button 
                                onClick={() => handleOpenCompletionModal(order)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                              >
                                 <Check size={14} />
                                 تسليم الإنتاج
                              </button>
                            ) : (
                              <div className="flex flex-col gap-0.5 items-center">
                                 <span suppressHydrationWarning className="text-red-500 font-black text-[10px]">
                                    خسارة: {order.abnormalLossValue?.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                                 </span>
                                 <span className="text-[8px] text-gray-300 font-bold">تالف غير طبيعي</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8">
          {/* Print Only Header */}
          <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-gray-900 pb-8 mb-8 text-center">
             <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">لؤلؤة العمدة - تقرير جرد الخامات</h1>
             <p className="text-lg font-bold text-gray-600 italic">
                تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}
             </p>
          </div>

          <div className="flex items-center justify-between print:hidden">
             <div className="flex items-center gap-3">
                <div className="h-10 w-1.5 rounded-full bg-emerald-500" />
                <h2 className="text-2xl font-black text-gray-800">بيان جرد مخزن الخامات</h2>
             </div>
             <button 
                onClick={() => window.print()}
                className="flex items-center gap-3 bg-white text-gray-800 border-2 border-gray-100 px-8 py-3 rounded-2xl font-black hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shadow-sm"
             >
                <Download size={20} />
                <span>طباعة جرد المخزن</span>
             </button>
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none print:rounded-none">
             <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse print:text-[12px]">
                   <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100 print:bg-gray-100 print:border-gray-900">
                         <th className="px-8 py-6 text-sm font-black text-gray-400 print:text-gray-900">كود الصنف</th>
                         <th className="px-8 py-6 text-sm font-black text-gray-400 print:text-gray-900">اسم الخامة</th>
                         <th className="px-8 py-6 text-sm font-black text-gray-400 text-center print:text-gray-900">الكمية المتاحة</th>
                         <th className="px-8 py-6 text-sm font-black text-gray-400 text-center print:text-gray-900">متوسط التكلفة</th>
                         <th className="px-8 py-6 text-sm font-black text-gray-400 text-center print:text-gray-900">إجمالي القيمة التقديرية</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 print:divide-gray-500">
                      {rawMaterials.map((item) => (
                         <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-6 font-bold text-gray-400 print:text-gray-900">{item.code}</td>
                            <td className="px-8 py-6">
                               <span className="font-black text-gray-800">{item.name}</span>
                            </td>
                            <td className="px-8 py-6 text-center font-black text-gray-800">
                               {item.stockQty} {item.unit}
                            </td>
                            <td suppressHydrationWarning className="px-8 py-6 text-center font-black text-blue-600">
                               {item.avgCost.toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                            </td>
                            <td suppressHydrationWarning className="px-8 py-6 text-center">
                               <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black print:bg-transparent print:p-0">
                                  {(item.stockQty * item.avgCost).toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                               </span>
                            </td>
                         </tr>
                      ))}
                      {/* Subtotal Row */}
                      <tr className="bg-gray-50/80 font-black text-lg">
                         <td colSpan={4} className="px-8 py-8 text-left">إجمالي قيمة مخزن الخامات:</td>
                         <td suppressHydrationWarning className="px-8 py-8 text-center text-emerald-600 border-t-2 border-emerald-500">
                            {rawMaterials.reduce((sum, item) => sum + (item.stockQty * item.avgCost), 0).toLocaleString('ar-EG', { numberingSystem: 'latn' })} ج.م
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}


      {/* Modals */}
      <MaterialModal 
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSuccess={fetchMaterials}
      />
      <WorkOrderModal 
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        onSuccess={fetchOrders}
      />
      <WorkOrderCompletionModal 
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onSuccess={() => { fetchMaterials(); fetchOrders(); }}
        order={selectedOrder}
      />
    </div>
  )
}
