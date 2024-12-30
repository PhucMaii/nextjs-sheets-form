'use client';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import Header from './components/LandingPage/Header';
import HowItWorks from './components/LandingPage/HowItWorks';
import TrustedBrand from './components/LandingPage/TrustedBrand';
import BestSeller from './components/LandingPage/BestSeller';
import InvitationSection from './components/LandingPage/InvitationSection';
import Footer from './components/LandingPage/Footer';
import NavbarWrapper from './lib/NavbarWrapper';
import RequestToJoinModal from './components/Modals/RequestToJoinModal';

export default function page() {
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);

  return (
    <NavbarWrapper setIsOpenSignUp={setIsOpenSignUp}>
      <RequestToJoinModal open={isOpenSignUp} onClose={() => setIsOpenSignUp(false)} />
      <Header setIsOpenSignUp={setIsOpenSignUp} />
      <HowItWorks />
      <TrustedBrand />
      <Box>
        <BestSeller />
        <InvitationSection setIsOpenSignUp={setIsOpenSignUp} />
      </Box>
      <Footer />
    </NavbarWrapper>
  );
}
