'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  LayoutDashboard, 
  Send, 
  ArrowRight, 
  Zap, 
  Droplets, 
  Sparkles, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  History, 
  Factory as FactoryIcon,
  AlertTriangle,
  ShoppingBag,
  Package
} from 'lucide-react'
import { getProducts } from '@/app/lib/actions/products'

// Constants
const GOLD_COLOR = "#D4AF37"
const WHATSAPP_SALES = "https://wa.me/201016712816"
const WHATSAPP_MANAGER = "https://wa.me/201001302928"

// Components
const Bubbles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: "110%", 
            x: `${Math.random() * 100}%` 
          }}
          animate={{ 
            opacity: [0, 0.4, 0.4, 0],
            y: "-10%", 
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear"
          }}
          style={{
            width: Math.random() * 80 + 20,
            height: Math.random() * 80 + 20,
          }}
          className="absolute rounded-full border border-white/40 bg-white/20 backdrop-blur-sm"
        />
      ))}
    </div>
  )
}

export default function LandingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts()
      setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])

  // Group products by category
  const categories = products.reduce((acc: any, product: any) => {
    if (!acc[product.category]) acc[product.category] = []
    acc[product.category].push(product)
    return acc
  }, {})

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-gray-900 scroll-smooth">
      {/* Navbar - Using z-50 to sit above video and overlay */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 md:px-12 bg-black/30 backdrop-blur-md border-b border-white/10">
        {/* Right: Logo */}
        <div className="flex items-center">
          <Link href="/" className="lomda-brand text-[#FF9900] text-3xl md:text-4xl whitespace-nowrap transition-transform hover:scale-105 active:scale-95 py-2">
            لؤلؤة العمدة
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { name: 'الرئيسية', href: '#hero' },
            { name: 'منتجاتنا', href: '#products' },
            { name: 'المصنع', href: '#factory' },
            { name: 'تواصل معنا', href: '#contact' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-lg font-bold text-white transition-colors duration-300 hover:text-[#D4AF37]"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Left: Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href={WHATSAPP_SALES}
            target="_blank"
            className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-2.5 font-bold text-white transition-transform hover:scale-105 active:scale-95"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">تسوق الآن</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border-2 border-[#D4AF37] px-6 py-2 font-bold text-white transition-all hover:bg-[#D4AF37]/10 active:scale-95"
          >
            <LayoutDashboard size={20} />
            <span className="hidden sm:inline">دخول الإدارة</span>
          </Link>
        </div>
      </nav>

      {/* 1. Hero Section - EXACT layering for visibility */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
        {/* Video Background - EXACT z-30 */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover -z-30"
        >
          <source src="/assets/trailer.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay - EXACT z-20 */}
        <div className="absolute inset-0 bg-black/60 -z-20" />

        {/* Content Wrapper - relative z-10 */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: "easeOut" }}
           className="relative z-10 px-6 text-center text-white md:max-w-4xl"
        >
          <h1 className="lomda-brand text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none drop-shadow-xl">
            <span style={{ color: '#FF9900' }}>لؤلؤة العمدة</span> <br className="md:hidden" />
            <span style={{ color: '#FFFFFF' }}>للمنظفات المتطورة</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl">
            صناع الجودة والنظافة منذ عام ١٩٩٤. نضع معايير عالمية في كل عبوة لحماية أسرتك وضمان الكفاءة القصوى في كل زاوية من منزلك.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href={WHATSAPP_SALES} target="_blank" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-4 text-xl font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
                >
                  تواصل معنا
                  <Send size={24} />
                </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 2. Featured Product Section - relative overflow-hidden bg-gray-50 */}
      <section className="relative overflow-hidden bg-gray-50 py-24 md:py-32">
        <Bubbles />
        {/* Content Wrapper - relative z-10 */}
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            {/* Left: Graphic Placeholder */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative flex h-[400px] w-full items-center justify-center md:w-1/2"
            >
              <div className="relative h-80 w-48 rounded-[2rem] bg-gradient-to-b from-[#D4AF37] to-[#B8860B] shadow-2xl flex items-center justify-center">
                 <Zap size={100} className="text-white opacity-50" />
                 <div className="absolute -top-4 w-24 h-12 bg-white rounded-t-full" />
                 <div className="absolute top/2 left/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-4xl whitespace-nowrap -rotate-90">
                    FLASH - فلاش
                 </div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-10 right-10 text-[#D4AF37]"
              >
                <Sparkles size={40} />
              </motion.div>
            </motion.div>

            {/* Right: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D4AF37]/10 px-4 py-1.5 text-sm font-bold text-[#D4AF37]">
                 <ShieldCheck size={16} />
                 المنتج رقم #1 في السوق
              </div>
              <h2 className="mb-6 text-4xl font-black md:text-5xl">
                فلاش لؤلؤة العمدة <br />
                <span className="text-[#D4AF37]">القوة القاهرة للرواسب</span>
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                منظف ومطهر قوي متعدد الاستخدامات، صُمم خصيصاً لإزالة الصدأ والأملاح والرواسب الكلسية الصعبة وتنظيف الحمامات والأحواض بكفاءة لا تضاهى. الخيار الأول لكل بيت ومنشأة تبحث عن النظافة المطلقة.
              </p>
              <div className="flex items-center gap-4">
                 <div className="h-1 bg-[#D4AF37] w-20 rounded-full" />
                 <span className="text-[#D4AF37] font-black text-xl italic uppercase tracking-widest">Digital Catalog - لؤلؤة العمدة</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Dynamic Storefront Section */}
      <section id="products" className="relative overflow-hidden bg-white py-24 min-h-[600px]">
        <Bubbles />
        <div className="relative z-10 container mx-auto px-6">
          <div className="mb-20 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-4 text-4xl font-black md:text-6xl text-gray-900"
            >
              متجر لؤلؤة العمدة <span className="text-[#D4AF37]">الإلكتروني</span>
            </motion.h2>
            <motion.div 
               initial={{ scaleX: 0 }}
               whileInView={{ scaleX: 1 }}
               viewport={{ once: true }}
               className="mx-auto h-1.5 w-32 rounded-full bg-[#D4AF37]" 
            />
            <p className="mt-6 text-gray-500 font-bold max-w-2xl mx-auto">
               استكشف تشكيلتنا الواسعة من المنظفات والمنتجات الورقية عالية الجودة. نوفر لك أفضل الحلول لاحتياجاتك اليومية.
            </p>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-12 w-12 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                <p className="text-[#D4AF37] font-black animate-pulse text-xl">جاري تحميل المنتجات...</p>
             </div>
          ) : Object.keys(categories).length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
               <Package size={64} className="mx-auto text-gray-300 mb-4" />
               <p className="text-gray-400 font-bold text-xl uppercase italic">لا يوجد منتجات متاحة حالياً.</p>
            </div>
          ) : (
            <div className="space-y-24">
              {['منظفات', 'صابون سائل', 'صابون قطع', 'منتجات ورقية', 'منتجات إضافية'].map((category) => {
                const categoryProducts = categories[category];
                if (!categoryProducts || categoryProducts.length === 0) return null;

                return (
                  <div key={category} className="space-y-10">
                    <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-black text-gray-800">{category}</h3>
                        <div className="flex-1 h-px bg-gradient-to-l from-[#D4AF37]/30 to-transparent" />
                        <div className="px-4 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-sm font-bold">
                          {categoryProducts.length} منتجات
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {categoryProducts.map((product: any, prodIdx: number) => (
                          <motion.div
                            key={product._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: prodIdx * 0.05 }}
                            whileHover={{ y: -10 }}
                            className="group relative flex flex-col bg-white rounded-[2.5rem] p-4 shadow-xl shadow-gray-100 hover:shadow-2xl hover:shadow-[#D4AF37]/10 border border-gray-50 transition-all"
                          >
                            {/* Image Area with Placeholder */}
                            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden mb-6 bg-gray-50 group-hover:shadow-inner transition-all flex items-center justify-center">
                               {product.imageUrl ? (
                                 <Image 
                                   src={product.imageUrl} 
                                   alt={product.name} 
                                   fill 
                                   className="object-cover group-hover:scale-110 transition-transform duration-500"
                                 />
                               ) : (
                                 <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-4">
                                    <div className="p-5 bg-white rounded-full shadow-sm text-gray-200 group-hover:text-[#D4AF37] transition-colors">
                                       <ShoppingBag size={48} />
                                    </div>
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                                 </div>
                               )}
                               
                               {/* Category Badge on Item */}
                               <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-[#D4AF37] shadow-sm">
                                  {category}
                               </div>
                            </div>

                            {/* Content */}
                            <div className="px-2 pb-2">
                               <h4 className="text-xl font-black text-gray-800 line-clamp-1 mb-2 group-hover:text-[#D4AF37] transition-colors">
                                  {product.name}
                               </h4>
                               
                               <div className="flex items-center justify-between gap-2 mb-4">
                                  <div className="text-2xl font-black text-[#D4AF37]">
                                     {product.prices?.retail?.toLocaleString('en-US') || product.price} <span className="text-sm font-bold">ج.م</span>
                                  </div>
                               </div>

                               {/* Helper Text for Cartons */}
                               {product.cartonPrice > 0 && (
                                 <div className="flex flex-col gap-1 mb-6 text-xs font-bold text-gray-400 italic">
                                    <div className="flex items-center gap-2">
                                       <div className="w-1 h-1 rounded-full bg-gray-300" />
                                       سعر الكرتونة: {product.cartonPrice.toLocaleString('en-US')} ج.م
                                    </div>
                                    {product.unitsPerCarton > 1 && (
                                      <div className="flex items-center gap-2">
                                         <div className="w-1 h-1 rounded-full bg-gray-300" />
                                         الكرتونة تحتوي على {product.unitsPerCarton} قطعة
                                      </div>
                                    )}
                                 </div>
                               )}

                               {/* Add to Cart Placeholder */}
                                <div className="flex items-center justify-center gap-2 w-full py-2 text-gray-300 font-bold text-xs italic">
                                   عرض المنتج فقط
                                </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Factory / About Section */}
      <section id="factory" className="relative overflow-hidden bg-[#1D1D1F] py-24 text-white">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-[#D4AF37]/5 skew-x-12 -translate-x-20" />
        <div className="container relative mx-auto px-6">
          <div className="flex flex-col items-center gap-16 md:flex-row">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="w-full md:w-1/2"
            >
               <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 rounded-2xl bg-white/5 p-6 flex flex-col justify-end border border-white/10">
                     <History size={32} className="text-[#D4AF37] mb-4" />
                     <div className="text-3xl font-black">25+ عاماً</div>
                     <div className="text-gray-400">خبرة ممتدة منذ 1994</div>
                  </div>
                  <div className="h-48 rounded-2xl bg-[#D4AF37]/20 p-6 flex flex-col justify-end border border-[#D4AF37]/30 mt-8">
                     <FactoryIcon size={32} className="text-[#D4AF37] mb-4" />
                     <div className="text-3xl font-black text-[#D4AF37]">آلي بالكامل</div>
                     <div className="text-white/80">أحدث خطوط الإنتاج</div>
                  </div>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/2"
            >
              <h2 className="mb-6 text-4xl font-black md:text-5xl">من داخل مصنعنا</h2>
              <p className="mb-8 text-xl leading-relaxed text-gray-400">
                نعتمد على أحدث تكنولوجيا خطوط الإنتاج لضمان الدقة والجودة في كل عبوة ننتجها. نلتزم بأعلى المعايير الصحية والبيئية لتوفير منتجات آمنة وفعالة تماماً.
              </p>
              <div className="space-y-4">
                {[
                  "خطوط الإنتاج الحديثة والتلقائية",
                  "ماكينات التعبئة الآلية عالية السرعة",
                  "بيئة تصنيع متطورة تخضع للرقابة الصارمة"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#D4AF37]" />
                    <span className="text-lg font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex flex-col items-center gap-6 rounded-3xl bg-red-600/10 border-2 border-red-600/30 p-8 text-center md:flex-row md:text-right"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/20">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-red-500">تنويه هام جداً!</h3>
              <p className="text-lg font-bold">
                احذروا المنتجات المقلدة - تأكد دائماً أن المنتج الأصلي صادر عن <span className="text-[#D4AF37]">مؤسسة لؤلؤة العمدة للمنظفات المتطورة</span> لضمان الحماية والكفاءة.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Footer / Contact Section */}
      <footer id="contact" className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-1">
              <Image
                src="/assets/logo.png"
                alt="لؤلؤة العمدة Logo"
                width={180}
                height={60}
                className="mb-6 h-12 w-auto object-contain"
              />
              <p className="text-gray-500 leading-relaxed">
                الرائدون في صناعة المنظفات المتطورة. حلول تنظيف ذكية لحياة أسهل وأكثر أماناً.
              </p>
            </div>

            <div>
               <h4 className="mb-6 text-xl font-black">روابط سريعة</h4>
               <ul className="space-y-4 font-bold text-gray-600">
                  <li><Link href="#hero" className="hover:text-[#D4AF37] transition-colors">الرئيسية</Link></li>
                  <li><Link href="#products" className="hover:text-[#D4AF37] transition-colors">منتجاتنا</Link></li>
                  <li><Link href="#factory" className="hover:text-[#D4AF37] transition-colors">قصتنا</Link></li>
               </ul>
            </div>

            <div className="md:col-span-2">
               <h4 className="mb-6 text-xl font-black">تواصل معنا</h4>
               <div className="grid gap-6 sm:grid-cols-2">
                  <Link href={WHATSAPP_MANAGER} target="_blank" className="flex items-center gap-4 group">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                        <Phone size={24} />
                     </div>
                     <div>
                        <div className="text-sm text-gray-400">مكتب المدير العام</div>
                        <div className="font-bold">01001302928</div>
                     </div>
                  </Link>
                  <Link href={WHATSAPP_SALES} target="_blank" className="flex items-center gap-4 group">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all">
                        <Phone size={24} />
                     </div>
                     <div>
                        <div className="text-sm text-gray-400">قسم المبيعات والتوزيع</div>
                        <div className="font-bold">01016712816</div>
                     </div>
                  </Link>
                  <div className="flex items-center gap-4 sm:col-span-2">
                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md text-[#D4AF37]">
                        <MapPin size={24} />
                     </div>
                     <div>
                        <div className="text-sm text-gray-400">العنوان</div>
                        <div className="font-bold">محافظة الغربية – مدينة زفتى، بجوار مسجد الحاجة حكمت.</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-20 border-t border-gray-200 pt-8 flex items-center justify-center">
            <div dir="ltr" className="flex items-center gap-2 text-sm font-medium">
              <span className="text-gray-500">Powered by</span>
              <a 
                href="https://nexara-platform.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-[#2563EB] hover:text-blue-500 transition-colors flex items-center gap-1"
              >
                Nexara FMW <span className="text-amber-400">⚡</span>
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="https://wa.me/201551190990" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-[#25D366] hover:text-emerald-500 transition-colors"
              >
                Hamza Abbas
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
