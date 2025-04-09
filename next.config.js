/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Improve performance,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

const withBundlerAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NEXT_PUBLIC_CURRENT_STATE !== 'production',
  register: true, // Register PWA service worker
  skipWaiting: true, // Skip wating for service worker activation
});

module.exports = withBundlerAnalyzer(withPWA(nextConfig));
