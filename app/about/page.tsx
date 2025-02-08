'use client';
import React, { useState } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import RequestToJoinModal from '../components/Modals/RequestToJoinModal';
import { Box, Typography } from '@mui/material';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import Logo from '../components/LandingPage/Logo';
import { grey } from '@mui/material/colors';

export default function AboutPage() {
  const [isOpenSignUp, setIsOpenSignUp] = useState<boolean>(false);

  return (
    <>
      <RequestToJoinModal
        open={isOpenSignUp}
        onClose={() => setIsOpenSignUp(false)}
      />
      <NavbarWrapper setIsOpenSignUp={setIsOpenSignUp}>
        <Box mt="140px" sx={{backgroundColor: 'white', minHeight: '100vh', minWidth: '100%'}}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Logo />
            <Box display="flex" flexDirection="column">
              <Typography
                sx={{ color: landingPagePrimaryColor }}
                textAlign="center"
                variant="h3"
              >
                Supreme Sprouts LTD
              </Typography>
              <Typography
                sx={{ color: landingPagePrimaryColor, fontWeight: 'normal' }} 
                textAlign="center" 
                variant="h6"
              >
                Freshness, Quality, and Variety
              </Typography>
              <Typography sx={{color: grey[600], mt: 2}}>
                We are serving Vancouver, Burnaby, Richmond, Coquitiam, Langley,
                Surrey, and surrounding areas every day of the week.
              </Typography>
            </Box>
        
          </Box>
        </Box>
      </NavbarWrapper>
    </>
  );
}
