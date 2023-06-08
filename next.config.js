/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '8080',
        pathname: '/api/**',
      },
    ],
  },
  output: 'standalone',
}

module.exports = nextConfig
