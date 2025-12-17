/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    // Add your Vercel deployment domain here after deployment
    // Example: remotePatterns: [{ protocol: 'https', hostname: 'your-app.vercel.app' }]
  },
}

module.exports = nextConfig

