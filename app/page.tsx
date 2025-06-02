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
    isValidating,
  } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
  });


  if (!session && isValidating) {
    return <LoadingComponent />
  }


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
