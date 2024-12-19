'use client';
import React from 'react';
import {
  Box,
} from '@mui/material';
import Navbar from '../components/LandingPage/Navbar';
import ProductHeader from '../components/ProductListingPage/ProductHeader';

export default function ProductPage() {
  return (
    <Box>
      <Navbar />
        <Box display="flex" flexDirection="column" gap={2} py={3} px={6}>
            <ProductHeader />
        </Box>
    </Box>
  );
}
