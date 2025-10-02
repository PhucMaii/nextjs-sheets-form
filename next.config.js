/** @type {import('next').NextConfig} */

const CDN_HOST = 'db3uf8fcaqsi.cloudfront.net';

const cloudfrontDomainRegex = new RegExp(
  `^https://${CDN_HOST.replace(/\./g, '\\.')}\\/.*`,
);

const runtimeCaching = [
  ...(cloudfrontDomainRegex
    ? [
        {
          urlPattern: cloudfrontDomainRegex,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-assets',
            expiration: {
              maxEntries: 2000,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ]
    : []),
  {
    urlPattern: /\/_next\/.*/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 500,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

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
  // images: {
  //   domains: [
  //     'supreme-sprouts-products.s3.us-west-2.amazonaws.com',
  //     'cheque-bucket.s3.us-west-2.amazonaws.com',
  //   ],
  // },
  // Allow CloudFront (+ temporary S3 fallback) for next/image
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // CloudFront (preferred)
      ...(CDN_HOST ? [{ protocol: 'https', hostname: CDN_HOST }] : []),
      // TEMP: keep S3 while migrating; remove once all URLs point to CloudFront
      {
        protocol: 'https',
        hostname: 'supreme-sprouts-products.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'cheque-bucket.s3.us-west-2.amazonaws.com',
      },
    ],
    // Optional: bump if you want longer CDN pulls for next/image
    minimumCacheTTL: 60,
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
