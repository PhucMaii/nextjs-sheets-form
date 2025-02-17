'use client';
import React from 'react';
import NavbarWrapper from './lib/NavbarWrapper';
import { Box, Button, Typography } from '@mui/material';
import { CircleX } from 'lucide-react';
import { errorColor } from '@/theme/color';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <NavbarWrapper>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
        mt={2}
        sx={{ width: '100%', backgroundColor: 'white', height: '100vh', mt: 4 }}
      >
        <CircleX style={{ color: errorColor, width: '80', height: '80px' }} />
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor, mt: 2 }}
        >
          🌾 404 - This Page Has Gone Back to Nature
        </Typography>
        <Typography
          variant="h5"
          fontWeight="normal"
          sx={{ color: landingPagePrimaryColor }}
        >
          But our garden is still thriving!
        </Typography>
        <Button
          sx={{
            mt: 4,
            backgroundColor: landingPagePrimaryColor,
            '&:hover': { backgroundColor: landingPageSecondaryColor },
          }}
          variant="contained"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </Box>
    </NavbarWrapper>
  );
}
