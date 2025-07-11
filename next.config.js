/** @type {import('next').NextConfig} */

const runtimeCaching = require('next-pwa/cache');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Improve performance
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['supreme-sprouts-products.s3.us-west-2.amazonaws.com'],
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
  swSrc: 'service-worker.js',
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_middleware\.js$/, // sometimes relevant
    /build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
  ],
  // runtimeCaching,
});

module.exports = withBundlerAnalyzer(withPWA(nextConfig));
