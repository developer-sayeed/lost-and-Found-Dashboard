/** @type {import('next').NextConfig} */
// Force dev server restart after mongodb dependency installed
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Fix for jsPDF fflate worker issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      worker_threads: false,
    }
    return config
  },
}

export default nextConfig
