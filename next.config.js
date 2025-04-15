/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Improve performance,
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
};

const withBundlerAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true, // Register PWA service worker
  skipWaiting: true, // Skip wating for service worker activation
  swSrc: 'public/push-sw.js'
});

module.exports = withBundlerAnalyzer(withPWA(nextConfig));
