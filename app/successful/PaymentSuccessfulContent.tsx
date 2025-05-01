'use client';
import NavbarWrapper from '@/app/lib/NavbarWrapper';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import VerifiedIcon from '@mui/icons-material/Verified';
import { successBackground, successColor } from '@/theme/color';
import { grey } from '@mui/material/colors';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessfulContent() {
  const searchParams: any = useSearchParams();
  const queryParams = searchParams?.get('type');

  const router = useRouter();

  const proceedToHome = () => {
    router.push('/');
  };

  return (
    <NavbarWrapper>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        pt={6}
        gap={1}
        sx={{ width: '100%', backgroundColor: 'white', height: '100vh' }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            backgroundColor: successBackground,
          }}
        >
          <VerifiedIcon sx={{ color: successColor, fontSize: 150 }} />
        </Box>
        <Typography
          textAlign="center"
          sx={{ color: successColor }}
          variant="h3"
          fontWeight="bold"
        >
          {queryParams === 'payment'
            ? 'Payment Successful'
            : 'Order Successful'}
        </Typography>p
        <Typography textAlign="center" variant="h6" fontWeight="bold" mt={2}>
          Thank you for your order
        </Typography>
        <Typography
          textAlign="center"
          sx={{ color: grey[600] }}
          variant="subtitle1"
        >
          We&apos;ve emailed you a confirmation with order details. <br />
          Please check your inbox at your earliest convenience.
        </Typography>

        <Button
          onClick={proceedToHome}
          variant="contained"
          sx={{
            backgroundColor: landingPagePrimaryColor,
            '&:hover': { backgroundColor: landingPageSecondaryColor },
          }}
        >
          Back to Home
          </Button>
        </Box>
      </NavbarWrapper>
  );
}