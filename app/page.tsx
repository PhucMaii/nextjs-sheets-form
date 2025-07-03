'use client';
import React, { useState } from 'react';
import Header from './components/LandingPage/Header';
import HowItWorks from './components/LandingPage/HowItWorks';
import TrustedBrand from './components/LandingPage/TrustedBrand';
import BestSeller from './components/LandingPage/BestSeller';
import InvitationSection from './components/LandingPage/InvitationSection';
import RequestToJoinModal from './components/Modals/RequestToJoinModal';
import NavbarWrapper from './lib/NavbarWrapper';
import ProductCategories from './components/LandingPage/ProductCategories';
import WhyUs from './components/LandingPage/WhyUs';
import useSWR from 'swr';
import { fetcher } from '@/HOC/AuthenGuard';
import LoadingComponent from './components/LoadingComponent/LoadingComponent';

export default function MainPage() {
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);

  const {
    data: session,
    error: sessionError,
    isValidating,
  } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 1,
    errorRetryInterval: 1000,
    timeout: 10000, // 10 second timeout
  });

  // Show loading if we're still validating and don't have data yet
  if (isValidating && !session && !sessionError) {
    return <LoadingComponent />
  }

  // If there's an error with session, just continue without session (guest mode)
  // The AuthenGuard will handle routing if authentication is required

  return (
    <NavbarWrapper>
      <RequestToJoinModal
        open={isOpenSignUp}
        onClose={() => setIsOpenSignUp(false)}
      />
      <Header />
      <HowItWorks />
      <ProductCategories />
      <BestSeller />
      <WhyUs />
      <TrustedBrand />
      {/* <Box> */}
      <InvitationSection />
      {/* </Box> */}
      {/* <Footer /> */}
    </NavbarWrapper>
  );
}
