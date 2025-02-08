import {
  howItWorksList,
  HowItWorksType,
  landingPagePrimaryColor,
} from '@/constant/landingPage';
import { Box, Grid, Typography } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import Image from 'next/image';
import React from 'react';

export default function HowItWorks() {
  return (
    <Box sx={{ backgroundColor: green[700] }} px={6} py={4}>
      <Typography variant="h3" sx={{ color: 'white', textAlign: 'center' }}>
        How It Works
      </Typography>

      <Grid container columnGap={4} rowGap={4} mt={4}>
        {howItWorksList.map((hiw: HowItWorksType) => {
          return (
            <Grid
              item
              xs={12}
              md={5.6}
              textAlign="center"
              lg={3.8}
              sx={{
                backgroundColor: landingPagePrimaryColor,
                borderRadius: 5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={2}
                justifyContent="center"
                alignItems="center"
                px={4}
                mx="auto"
                py={6}
              >
                <Image
                  src={hiw.image}
                  alt={hiw.title}
                  width={300}
                  height={200}
                  objectFit="contain" // Ensures the image maintains its aspect ratio
                  style={{ borderRadius: 20, minWidth: '100%' }}
                />

                <Typography
                  variant="h5"
                  fontWeight="bold"
                  textAlign="center"
                  sx={{ color: 'white' }}
                >
                  {hiw.title}
                </Typography>
                <Typography
                  variant="subtitle1"
                  textAlign="center"
                  sx={{ color: grey[50], fontWeight: 'semiBold' }}
                >
                  {hiw.description}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
