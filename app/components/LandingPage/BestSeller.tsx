import {
  bestSellers,
  BestSellerType,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export default function BestSeller() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={4}
      p={4}
      sx={{ backgroundColor: landingPageSecondaryColor }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        textAlign="center"
        sx={{ color: 'white' }}
      >
        Our Best Sellers
      </Typography>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        gap={3}
      >
        {bestSellers.map((bestSellerItem: BestSellerType, index: number) => {
          return (
            <Box
              key={index}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
            >
              <Image
                src={bestSellerItem.image}
                alt={bestSellerItem.name}
                width={250}
                height={150}
                style={{ borderRadius: 20 }}
              />
              <Typography variant="h5" sx={{ color: 'white' }}>
                {bestSellerItem.name}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
