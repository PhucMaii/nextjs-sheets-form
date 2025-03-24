'use client';
import React, { useState } from 'react';
import Header from './components/LandingPage/Header';
import HowItWorks from './components/LandingPage/HowItWorks';
import TrustedBrand from './components/LandingPage/TrustedBrand';
import BestSeller from './components/LandingPage/BestSeller';
import InvitationSection from './components/LandingPage/InvitationSection';
import Footer from './components/LandingPage/Footer';
import RequestToJoinModal from './components/Modals/RequestToJoinModal';
import NavbarWrapper from './lib/NavbarWrapper';

export default function page() {
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);

  return (
    <NavbarWrapper>
      <RequestToJoinModal
        open={isOpenSignUp}
        onClose={() => setIsOpenSignUp(false)}
      />
      <Header />
      <HowItWorks />
      <BestSeller />
      <TrustedBrand />
      {/* <Box> */}
      <InvitationSection />
      {/* </Box> */}
      <Footer />
    </NavbarWrapper>
  );
}
