/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Hides the floating "N" dev-tools badge in local development. It never
  // renders in production builds; this only keeps screenshots clean.
  devIndicators: false,
  async redirects() {
    return [
      // Language-era URL kept alive for bookmarks and old emails.
      { source: '/admin/operators', destination: '/admin/testers', permanent: true },
    ]
  },
  transpilePackages: ['@oreset/shared'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
