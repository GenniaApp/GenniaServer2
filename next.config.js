/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');
const nextConfig = {
  i18n,
  reactStrictMode: false,
  swcMinify: true,
  images: {
    domains: ['localhost'],
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
};

module.exports = nextConfig;
