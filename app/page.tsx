'use client';
import React from 'react';
import { Box } from '@mui/material';
import Header from './components/LandingPage/Header';
import HowItWorks from './components/LandingPage/HowItWorks';
import TrustedBrand from './components/LandingPage/TrustedBrand';
import BestSeller from './components/LandingPage/BestSeller';
import InvitationSection from './components/LandingPage/InvitationSection';
import Footer from './components/LandingPage/Footer';
import NavbarWrapper from './lib/NavbarWrapper';

export default function page() {
  return (
    <NavbarWrapper>
      <Header />
      <HowItWorks />
      <TrustedBrand />
      <Box>
        <BestSeller />
        <InvitationSection />
      </Box>
      <Footer />
    </NavbarWrapper>
  );
}
