import { blue, indigo, pink, yellow } from '@mui/material/colors';
import {
  BadgeCheckIcon,
  BicepsFlexed,
  HandshakeIcon,
  ShieldCheckIcon,
} from 'lucide-react';

export const landingPagePrimaryColor = '#2E7D32';
export const landingPageSecondaryColor = '#FF7043';
export const landingPageGreyColor = '#424242';

export type HowItWorksType = {
  title: string;
  description: string;
  image: string;
};

export const howItWorksList: HowItWorksType[] = [
  {
    title: 'Online Order',
    description:
      'Order what you need from our website at your convenience, and within seconds, all your food supplies will be prepared and ready to fuel your day.',
    image: '/images/landing/how_it_works/online_order.png',
  },
  {
    title: 'Freshly Delivery',
    description:
      'Our experienced drivers, familiar with local routes, handle deliveries with care, ensuring the freshness and quality of your items every step of the way.',
    image: '/images/landing/how_it_works/vegetables_on_truck.jpeg',
  },
  {
    title: 'Your Turn',
    description: `We handle the quality so you can focus on the quantity. It's your turn to use our products and grow your business your way—always with guaranteed freshness and top-notch quality.`,
    image: '/images/landing/how_it_works/vegetables_in_restaurant.jpeg',
  },
];

export type TrustedType = {
  title: string;
  description: string;
  icon: any;
  iconBackground: string;
};
export const trustedList: TrustedType[] = [
  {
    title: 'Proven Reliability',
    description: 'Consistent deliveries that businesses can count on.',
    icon: BicepsFlexed,
    iconBackground: yellow[50],
  },
  {
    title: 'High Quality',
    description: 'Sourcing only the freshest produce.',
    icon: BadgeCheckIcon,
    iconBackground: indigo[50],
  },
  {
    title: 'Local Commitment',
    description: 'Supporting Vancouver’s vibrant food community.',
    icon: ShieldCheckIcon,
    iconBackground: blue[50],
  },
  {
    title: 'Friendly Service',
    description: 'A team that understands your needs.',
    icon: HandshakeIcon,
    iconBackground: pink[50],
  },
];

export type BestSellerType = {
  name: string;
  image: string;
};
export const bestSellers: BestSellerType[] = [
  {
    name: 'BEAN SPROUTS',
    image: '/images/landing/best_sellers/beansprouts.jpeg',
  },
  {
    name: 'SOYA SPROUTS',
    image: '/images/landing/best_sellers/soya_sprouts.jpeg',
  },
  {
    name: 'BASIL',
    image: '/images/landing/best_sellers/basil.jpeg',
  },
  {
    name: 'RICE NOODLES',
    image: '/images/landing/best_sellers/rice_noodles.jpeg',
  },
  {
    name: 'JUMBO EGGS',
    image: '/images/landing/best_sellers/jumbo_egg.jpeg',
  },
];
