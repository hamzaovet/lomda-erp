'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Users, 
  Search, 
  Plus, 
  Pencil, 
  Trash2,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  Store,
  Phone,
  MapPin,
  Banknote,
  User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCustomers, deleteCustomer } from '@/app/lib/actions/customers'
import CustomerModal from './CustomerModal'
import CustomerPaymentModal from './CustomerPaymentModal'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  const fetchCustomers = async () => {
    setIsLoading(true)
    const data = await getCustomers()
    setCustomers(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDelete = async (id: string) => {
    const pin = window.prompt("⚠️ لإتمام عملية الحذف النهائية، يرجى إدخال الرقم السري لمدير النظام:");
    
    if (pin === "2026") {
      startTransition(async () => {
        const result = await deleteCustomer(id)
        if (result.success) fetchCustomers()
        else alert(result.error)
      })
    } else if (pin !== null) {
      alert("❌ رمز الأمان غير صحيح. تم إلغاء عملية الحذف لحماية البيانات.");
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const externalMarketDebt = customers
    .filter(c => c.customerType === 'external' && c.currentBalance > 0)
    .reduce((sum, c) => sum + (c.currentBalance || 0), 0)

  const internalBranchBalance = customers
    .filter(c => c.customerType === 'internal_branch')
    .reduce((sum, c) => sum + (c.currentBalance || 0), 0)

  return (
    <div className="flex flex-col gap-8 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">إدارة العملاء والفروع</h1>
        <p className="text-gray-500 font-bold italic">نظم حسابات السوق الخارجي وحركة فروعك الداخلية بكل شفافية.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "إجمالي العملاء", value: customers.length.toString(), icon: Users, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5" },
          { label: "مديونيات السوق (لينا برة)", value: `${externalMarketDebt.toLocaleString('en-US')} ج.م`, icon: Banknote, color: "text-red-500", bg: "bg-red-50" },
          { label: "أرصدة الفروع الداخلية", value: `${internalBranchBalance.toLocaleString('en-US')} ج.م`, icon: Store, color: "text-blue-600", bg: "bg-blue-50" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className="text-gray-300">
                <TrendingDown size={20} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-bold text-sm mb-1">{stat.label}</p>
              <p 
                suppressHydrationWarning
                className={`text-2xl font-black ${stat.color === 'text-red-500' ? 'text-red-600' : 'text-gray-800'}`}
              >
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={20} />
            <span>تصفية</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-[#D4AF37] text-white px-8 py-3 rounded-3xl font-black shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={24} />
            <span>إضافة عميل / فرع</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
          <p className="text-gray-400 font-bold italic">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">الاسم</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">الموبايل</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">نوع الحساب</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">الفئة</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">الرصيد الحالي</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCustomers.map((customer) => {
                  const isBranch = customer.customerType === 'internal_branch';
                  const balance = customer.currentBalance || 0;

                  return (
                    <tr key={customer._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${isBranch ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-[#D4AF37]'}`}>
                            {isBranch ? <Store size={22} /> : <User size={22} />}
                          </div>
                          <div>
                            <p className="font-black text-gray-800">{customer.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                               <MapPin size={10} />
                               {customer.address || "بدون عنوان"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                           <Phone size={14} className="text-gray-300" />
                           <span>{customer.phone || "-"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {isBranch ? (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black border border-blue-200">فرع لؤلؤة العمدة</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-black">عميل خارجي</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className="text-gray-400 font-black text-xs">{customer.pricingTier}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className={`font-black text-sm ${balance > 0 ? 'text-red-600' : balance < 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                              {Math.abs(balance).toLocaleString('en-US')} ج.م
                           </span>
                           <span className="text-[8px] font-black uppercase text-gray-400">
                              {balance > 0 ? "مديونية" : balance < 0 ? "رصيد دائن" : "مسوي"}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
                            title="تعديل البيانات"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsPaymentModalOpen(true);
                            }}
                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" 
                            title="تحصيل دفعة (سند قبض)"
                          >
                            <Banknote size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer._id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold italic bg-gray-50/20">
               لا يوجد عملاء أو فروع مطابقة للبحث.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSuccess={fetchCustomers}
        customer={selectedCustomer}
      />

      <CustomerPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSuccess={fetchCustomers}
        customer={selectedCustomer}
      />
    </div>
  )
}
