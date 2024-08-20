/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Improve performance
};

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NEXT_PUBLIC_CURRENT_STATE !== 'development',
  register: true, // Register PWA service worker
  skipWaiting: true, // Skip wating for service worker activation
});

module.exports = withPWA(nextConfig);
