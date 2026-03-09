/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_RPC_URL: process.env.CUSTOM_RPC_URL,
  },
}

module.exports = nextConfig
