/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Use src directory
  distDir: '.next',
  // Enable source maps for development
  productionBrowserSourceMaps: false,
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Enable powered by header removal
  poweredByHeader: false,
}

export default nextConfig
