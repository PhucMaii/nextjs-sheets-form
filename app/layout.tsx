import React from 'react';
import type { Metadata } from 'next';
// import { Inter } from '@next/font/google';
import './globals.css';
import { Providers } from './provider';
import { CssBaseline, ThemeProvider } from '@mui/material';
import '../styles/reactCalendar.css';
import '../styles/animation.css';
import UserContextAPI from './context/UserContextAPI';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { theme } from '@/theme';
import 'react-color-palette/css';

// import { CacheProvider } from '@emotion/react';

// Create cache for SSR
// const clientSideEmotionCache = createEmotionCache();

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Supreme Sprouts Ltd.',
  description: `Supreme Sprouts LTD is a leading supplier of fresh produce and microgreens in Canada, specializing in high-quality, locally grown vegetables for restaurants, cafés, and food businesses. Our wholesale produce delivery service makes it easy to keep your kitchen stocked with vibrant, nutritious, and sustainable ingredients.

From crisp microgreens to bulk wholesale vegetables, Supreme Sprouts ensures every order is fresh, reliable, and delivered on time. We work with chefs, retailers, and foodservice operators who value farm-to-table quality, consistent supply, and exceptional customer service.

Choose Supreme Sprouts as your trusted produce supplier in Canada—because fresh, local food creates unforgettable flavor.`,
  generator: 'Next.js',
  keywords: ['supreme sprouts', 'Supreme Sprouts Ltd.', 'SupremeSprouts'],
  authors: [
    { name: 'Bin Mai' },
    {
      name: 'Mai Thien Phuc',
      url: 'https://maithienphuc.vercel.app',
    },
  ],
  icons: {
    icon: ['/logo-48x48.png'],
    apple: ['/logo-144.png'],
    shortcut: ['/logo-144.png'],
  },
  manifest: '/manifest.json',
};

export const viewport = {
  'minimum-scale': '1',
  'initial-scale': '1',
  width: 'device-width',
  'shrink-to-fit': 'no',
  'viewport-fit': 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <CacheProvider value={clientSideEmotionCache}> */}
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body id="root">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Providers>
              <UserContextAPI>{children}</UserContextAPI>
            </Providers>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
      {/* </CacheProvider> */}
    </html>
  );
}
