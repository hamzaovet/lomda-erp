'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Plus, 
  Pencil, 
  Trash2,
  Filter,
  FlaskConical,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Beaker,
  AlertCircle,
  Sparkles,
  ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getProducts, deleteProduct, seedInitialProducts } from '@/app/lib/actions/products'
import FormulaModal from './FormulaModal'
import ProductModal from './ProductModal'

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'manufactured' | 'traded'>('manufactured')
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  const fetchProducts = async () => {
    setIsLoading(true)
    const data = await getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return
    startTransition(async () => {
      const result = await deleteProduct(id)
      if (result.success) fetchProducts()
      else alert(result.error)
    })
  }

  const handleSeed = async () => {
    if (!confirm('هل تريد تهيئة قائمة منتجات لؤلؤة العمدة الافتراضية؟')) return
    setIsLoading(true)
    const result = await seedInitialProducts()
    if (result.success) {
      alert(result.message)
      await fetchProducts()
    } else {
      alert(result.error)
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((p: any) => {
    const pType = p.productType || 'manufactured'; // Resilient Fallback
    return pType === activeTab &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const totalValue = products.reduce((sum: number, p: any) => sum + (p.stockQty * (p.prices?.wholesale || 0)), 0)

  const formatStock = (totalPieces: number, packagingSize: number, unitName: string) => {
    if (!packagingSize || packagingSize <= 1) return `${totalPieces} ${unitName}`;
    const cartons = Math.floor(totalPieces / packagingSize);
    const pieces = totalPieces % packagingSize;
    
    if (cartons === 0) return `${pieces} ${unitName}`;
    if (pieces === 0) return `${cartons} كرتونة`;
    return `${cartons} كرتونة و ${pieces} ${unitName}`;
  };

  return (
    <div className="flex flex-col gap-8 p-1 sm:p-2 md:p-4 lg:p-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-800">إدارة المنتجات والمخزون</h1>
        <p className="text-gray-500 font-bold italic">تابع حالة منتجاتك وحركة المخازن بكل دقة.</p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-4 bg-gray-100/50 p-1.5 rounded-[2rem] w-fit border border-gray-200">
        <button
          onClick={() => setActiveTab('manufactured')}
          className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all ${activeTab === 'manufactured' ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <TrendingUp size={20} />
          <span>منتجات التصنيع</span>
        </button>
        <button
          onClick={() => setActiveTab('traded')}
          className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all ${activeTab === 'traded' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <ShoppingBag size={20} />
          <span>المنتجات الجاهزة (تداول)</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: activeTab === 'manufactured' ? "منتجات التصنيع" : "المنتجات الجاهزة", value: products.filter(p => p.productType === activeTab).length.toString(), icon: Package, color: activeTab === 'manufactured' ? "text-[#D4AF37]" : "text-blue-600", bg: activeTab === 'manufactured' ? "bg-[#D4AF37]/5" : "bg-blue-50" },
          { label: "نواقص المخزن", value: products.filter(p => p.productType === activeTab && p.stockQty < 50).length.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "إجمالي قيمة المخزون", value: `${totalValue.toLocaleString('en-US')} ج.م`, icon: TrendingUp, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/5" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className="text-gray-300">
                <TrendingUp size={20} />
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
            placeholder={`ابحث في ${activeTab === 'manufactured' ? 'منتجات التصنيع' : 'المنتجات الجاهزة'}...`}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'manufactured' && (
            <button 
              onClick={handleSeed}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Sparkles size={20} />
              <span>تهيئة لؤلؤة العمدة</span>
            </button>
          )}
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className={`flex flex-1 md:flex-none items-center justify-center gap-2 ${activeTab === 'manufactured' ? 'bg-[#D4AF37] shadow-[#D4AF37]/20' : 'bg-blue-600 shadow-blue-600/20'} text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
          >
            <Plus size={24} />
            <span>إضافة {activeTab === 'manufactured' ? 'منتج تصنيع' : 'منتج جاهز'}</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-4 shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
          <p className="text-gray-400 font-bold italic">جاري تحميل قائمة المنتجات...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">اسم المنتج</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">الفئة</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">{activeTab === 'manufactured' ? 'خامات الروشتة' : 'الحالة'}</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">{activeTab === 'manufactured' ? 'تكلفة التصنيع' : 'متوسط التكلفة'}</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">سعر الجملة</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">الكمية</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => {
                  const hasFormula = product.formula && product.formula.length > 0;
                  const prodCost = product.costs?.manufacturing || 0;
                  const retailPrice = product.prices?.retail || 0;
                  const isHighRisk = prodCost >= retailPrice && hasFormula;
                  const isLowMargin = hasFormula && !isHighRisk && (retailPrice - prodCost) < (retailPrice * 0.15);

                  return (
                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center text-[#D4AF37]">
                            <Package size={24} />
                          </div>
                          <div>
                            <p className="font-black text-gray-800">{product.name}</p>
                            <p className="text-[10px] font-bold text-gray-400">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-500 font-bold">{product.category}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        {product.productType === 'traded' ? (
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black w-fit mx-auto border border-blue-100">
                             <ShoppingBag size={12} />
                             <span>منتج جاهز</span>
                          </div>
                        ) : hasFormula ? (
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black w-fit mx-auto">
                             <Beaker size={12} />
                             <span>{product.formula.length} خامات</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black w-fit mx-auto border border-red-100">
                             <AlertCircle size={12} />
                             <span>نقص تركيبة</span>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-black text-sm ${isHighRisk ? 'text-red-600' : isLowMargin ? 'text-amber-600' : 'text-gray-800'}`}>
                            {product.productType === 'traded' ? (product.purchaseCost || 0).toLocaleString('en-US') : prodCost.toLocaleString('en-US')} ج.م
                          </span>
                          {isHighRisk && <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">خسارة محققة!</span>}
                          {isLowMargin && <span className="text-[8px] font-black text-amber-500 uppercase">هامش ربح ضعيف</span>}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-gray-800 font-black">{product.prices?.wholesale || 0} ج.م</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`font-black ${product.stockQty < 50 ? 'text-red-500' : 'text-gray-800'}`}>
                          {formatStock(product.stockQty, product.packagingSize, product.baseUnitName || 'قطعة')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          {product.productType === 'manufactured' && (
                            <button 
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsFormulaModalOpen(true);
                              }}
                              className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
                              title="تعديل الروشتة"
                            >
                              <FlaskConical size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="p-2.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-xl transition-all border border-transparent" 
                            title="تعديل"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent" 
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
          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold italic bg-gray-50/20">
               لا توجد منتجات مطابقة لعملية البحث.
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ProductModal 
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={fetchProducts}
        product={selectedProduct}
        activeTabType={activeTab}
      />
      <FormulaModal 
        isOpen={isFormulaModalOpen}
        onClose={() => {
          setIsFormulaModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </div>
  )
}
