'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  Factory, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  LogOut, 
  User,
  Users,
  Bell,
  Search,
  Menu,
  Wallet
} from 'lucide-react'

// Constants
const GOLD_COLOR = "#D4AF37"
const SIDEBAR_BG = "#1D1D1F"

const navLinks = [
  { name: "الرئيسية", href: "/dashboard", icon: Home },
  { name: "التصنيع والخامات", href: "/dashboard/manufacturing", icon: Factory },
  { name: "المنتجات والمخزون", href: "/dashboard/products", icon: Package },
  { name: "فواتير المبيعات", href: "/dashboard/sales", icon: ShoppingCart },
  { name: "فواتير المشتريات", href: "/dashboard/purchases", icon: ShoppingCart },
  { name: "إدارة الموردين", href: "/dashboard/suppliers", icon: Users },
  { name: "إدارة العملاء والفروع", href: "/dashboard/customers", icon: Users },
  { name: "الخزينة والمصروفات", href: "/dashboard/treasury", icon: Wallet },
  { name: "التقارير والماليات", href: "/dashboard/reports", icon: TrendingUp },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans" dir="rtl">
      {/* Sidebar (Right) */}
      <aside 
        className="hidden md:flex flex-col w-72 h-full text-white shrink-0 border-l border-white/5 print:hidden"
        style={{ backgroundColor: SIDEBAR_BG }}
      >
        {/* Sidebar Header */}
        <div className="p-8 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 group">
             <div className="relative h-10 w-10 flex-shrink-0 bg-white rounded-lg p-1 group-hover:scale-105 transition-transform">
                <Image 
                    src="/assets/logo.png" 
                    alt="لؤلؤة العمدة Logo" 
                    fill
                    className="object-contain" 
                />
             </div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black text-[#D4AF37] whitespace-nowrap">لؤلؤة العمدة</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">الإدارة الذكية</span>
             </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon 
                  size={22} 
                  className={isActive ? "text-white" : "text-gray-500 group-hover:text-[#D4AF37] transition-colors"} 
                />
                <span className="font-bold">{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/5">
          <button 
             onClick={() => signOut({ callbackUrl: '/' })}
             className="flex w-full items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-bold group"
          >
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Left) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
             <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={24} />
             </button>
             <h2 className="text-xl font-bold text-gray-800">
               {navLinks.find(link => pathname === link.href)?.name || "لوحة التحكم الرئيسية"}
             </h2>
          </div>

          <div className="flex items-center gap-6">
             {/* Search Bar - Hidden on small screens */}
             <div className="hidden lg:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 gap-3 w-72 focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all">
                <Search size={18} className="text-gray-400" />
                <input 
                   type="text" 
                   placeholder="ابحث هنا..." 
                   className="bg-transparent border-none outline-none text-sm w-full font-bold placeholder:text-gray-400"
                />
             </div>

             {/* Notifications */}
             <button className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-[#D4AF37] rounded-xl transition-all">
                <Bell size={22} />
                <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full"></span>
             </button>

             {/* User Profile */}
             <div className="flex items-center gap-3 pr-6 border-r border-gray-200">
                <div className="hidden md:flex flex-col items-start translate-y-0.5">
                   <span className="text-sm font-black text-gray-800 uppercase">إدارة لؤلؤة العمدة</span>
                   <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">مدير النظام</span>
                </div>
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white shadow-md shadow-[#D4AF37]/20">
                   <User size={24} />
                </div>
             </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-8 relative print:p-0 print:overflow-visible">
           <div className="max-w-[1600px] mx-auto">
             {children}
           </div>
        </main>
      </div>
    </div>
  )
}
