/** @type {import('next').NextConfig} */
const { setupDevPlatform } = process.env.NODE_ENV === 'development'
  ? require('@cloudflare/next-on-pages/next-dev')
  : { setupDevPlatform: () => {} }

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
