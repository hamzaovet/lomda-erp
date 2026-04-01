'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Lock, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans text-white">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-30"
      >
        <source src="/assets/trailer.mp4" type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/70 -z-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 via-transparent to-black/80 -z-10" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6 py-12"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-white p-3 rounded-2xl mb-4 shadow-lg">
              <Image
                src="/assets/logo.png"
                alt="لؤلؤة العمدة Logo"
                width={120}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-black mb-2">تسجيل الدخول</h1>
            <p className="text-gray-400 font-bold">بوابة الإدارة الذكية - لؤلؤة العمدة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-300 pr-2">البريد الإلكتروني</label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold"
                  placeholder="admin@lomda.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-300 pr-2">كلمة المرور</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all font-bold"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 text-sm font-bold"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-4 rounded-2xl text-xl font-black shadow-lg shadow-yellow-600/20 active:scale-95 transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
