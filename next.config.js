/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CUSTOM_KEY: 'club-programacion-ugr',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 