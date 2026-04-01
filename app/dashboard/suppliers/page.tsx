'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Users, 
  UserPlus, 
  Phone, 
  Trash2, 
  Edit, 
  Search, 
  Building2,
  Loader2,
  Banknote
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSuppliers, deleteSupplier } from '@/app/lib/actions/suppliers'
import SupplierModal from './SupplierModal'
import SupplierPaymentModal from './SupplierPaymentModal'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isPending, startTransition] = useTransition()

  const fetchSuppliers = async () => {
    setIsLoading(true)
    const data = await getSuppliers()
    setSuppliers(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleDelete = async (id: string) => {
    const pin = window.prompt("⚠️ لإتمام عملية الحذف النهائية، يرجى إدخال الرقم السري لمدير النظام:");
    
    if (pin === "2026") {
      startTransition(async () => {
        const result = await deleteSupplier(id)
        if (result.success) {
          fetchSuppliers()
        } else {
          alert(result.error)
        }
      })
    } else if (pin !== null) {
      alert("❌ رمز الأمان غير صحيح. تم إلغاء عملية الحذف لحماية البيانات.");
    }
  }

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  )

  return (
    <div className="flex flex-col gap-8 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Building2 className="text-[#D4AF37]" size={32} />
            إدارة الموردين
          </h1>
          <p className="text-gray-500 font-bold italic mt-1">إدارة كاملة لموردي الخامات والمنتجات الجاهزة.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedSupplier(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#D4AF37] text-white px-8 py-3.5 rounded-3xl font-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <UserPlus size={24} />
          <span>إضافة مورد جديد</span>
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
          <input
            type="text"
            placeholder="ابحث باسم المورد أو رقم الهاتف..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
           <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
           <p className="text-gray-400 font-bold italic">جاري تحميل قائمة الموردين...</p>
        </div>
      ) : filteredSuppliers.length > 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">اسم المورد</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">الفئة</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">رقم الهاتف</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">الرصيد الحالي</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 uppercase">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-[#1D1D1F] flex items-center justify-center text-[#D4AF37] font-black shadow-md">
                        {supplier.name.charAt(0)}
                      </div>
                      <span className="font-black text-gray-800">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black inline-block border ${
                      supplier.category === 'Raw' 
                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                        : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {supplier.category === 'Raw' ? 'مورد خامات' : 'مورد بضائع جاهزة'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-500 font-bold">
                      <Phone size={14} className="text-gray-300" />
                      {supplier.phone}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`font-black text-sm ${supplier.currentBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {Math.abs(supplier.currentBalance).toLocaleString()} ج.م
                      {supplier.currentBalance > 0 && <span className="text-[8px] mr-1 uppercase">(دائن)</span>}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setIsPaymentModalOpen(true);
                        }}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="سداد دفعة (سند صرف)"
                      >
                        <Banknote size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(supplier._id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center gap-6 border border-dashed border-gray-200">
           <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
              <Users size={64} />
           </div>
           <div className="space-y-2">
             <h3 className="text-2xl font-black text-gray-800">لا يوجد موردين حالياً</h3>
             <p className="text-gray-400 font-bold italic max-w-xs">ابدأ بإضافة أول مورد لشركتك لتبدأ في إدارة المشتريات والحسابات.</p>
           </div>
           <button 
             onClick={() => {
                setSelectedSupplier(null);
                setIsModalOpen(true);
             }}
             className="text-[#D4AF37] font-black underline underline-offset-8 hover:text-[#B8860B] transition-colors"
           >
             إضافة مورد الآن
           </button>
        </div>
      )}

      {/* Supplier Modal */}
      <SupplierModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSuccess={fetchSuppliers}
        supplier={selectedSupplier}
      />

      <SupplierPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedSupplier(null);
        }}
        onSuccess={fetchSuppliers}
        supplier={selectedSupplier}
      />
    </div>
  )
}
