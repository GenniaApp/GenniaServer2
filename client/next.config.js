const { i18n } = require('./next-i18next.config');

// @ts-check
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n,
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    reactCompiler: true,
  }
};

module.exports = nextConfig;
