/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NEXT_PUBLIC_CURRENT_STATE !== 'development',
  register: true, // Register PWA service worker
  skipWaiting: true, // Skip waiting for service worker activation
  runtimeCaching: [
    {
      urlPattern: /^\/_next\/static\/chunks\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-chunks',
        expiration: {
          maxEntries: 50,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Improve performance
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

module.exports = withBundleAnalyzer(withPWA(nextConfig));
