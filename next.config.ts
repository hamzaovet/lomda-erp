import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // تجاهل أخطاء التايب سكريبت وقت الرفع
    ignoreBuildErrors: true,
  },
  eslint: {
    // تجاهل أخطاء الإيسلنت وقت الرفع
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;