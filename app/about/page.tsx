'use client';
import React from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, Grid, Typography } from '@mui/material';
import {
  landingPagePrimaryColor,
  maxWidth,
  reasonList,
} from '@/constant/landingPage';
import Logo from '../components/LandingPage/Logo';
import { green, grey } from '@mui/material/colors';
import Footer from '../components/LandingPage/Footer';

export default function AboutPage() {
  const renderHeader = () => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Box display="flex" flexDirection="column" gap={1}>
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
            variant="h5"
          >
            Freshness, Quality, and Variety
          </Typography>
          <Typography sx={{ color: grey[600], mt: 2 }} textAlign="center">
            We are serving Greater of Vancouver, Burnaby, Richmond, Coquitiam, Langley,
            Surrey, and surrounding areas every day of the week.
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderAboutUs = () => {
    return (
      <Grid
        spacing={2}
        container
        sx={{ maxWidth: maxWidth, mx: 'auto', p: 3, mt: 2 }}
      >
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 2,
              color: 'white',
              backgroundColor: landingPagePrimaryColor,
              height: '100%',
              borderRadius: '10px',
            }}
          >
            <Logo />
            <Typography variant="h5" fontWeight="bold">
              Why us?
            </Typography>
            <Typography variant="body1" sx={{ color: grey[50] }}>
              We has been serving the community for over 35 years since 1990. We
              are committed to providing the premium-quality products and
              services to our customers.
            </Typography>
          </Box>
        </Grid>
        <Grid container item xs={12} md={8} spacing={2}>
          {reasonList.map((reason: any, index: number) => {
            return (
              <Grid item xs={6} key={index}>
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={1}
                  sx={{
                    backgroundColor: landingPagePrimaryColor,
                    p: 2,
                    color: 'white',
                    height: '100%',
                    borderRadius: '10px',
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      backgroundColor: green[50],
                      borderRadius: '50%',
                      width: 50,
                      height: 50,
                    }}
                  >
                    <reason.icon
                      style={{ color: green[800], width: 30, height: 30 }}
                    />
                  </Box>
                  <Typography variant="h5" fontWeight="bold">
                    {reason.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: grey[50] }}>
                    {reason.description}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    );
  };
  return (
    <>
      <NavbarWrapper>
        <Box
          sx={{
            backgroundColor: 'white',
            pt: 4,
            minHeight: '100vh',
            minWidth: '100%',
          }}
        >
          {renderHeader()}

          <Box sx={{ backgroundColor: green[700] }}>{renderAboutUs()}</Box>
          <Footer />
        </Box>
      </NavbarWrapper>
    </>
  );
}
