import { maxWidth, trustedList, TrustedType } from '@/constant/landingPage';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import TrustedCard from './TrustedCard';

export default function TrustedBrand() {
  return (
    <Box sx={{ backgroundColor: 'white' }}>
      <Box
        display="flex"
        flexDirection="column"
        // justifyContent="center"
        alignItems="center"
        py={4}
        sx={{
          maxWidth: maxWidth,
          mx: 'auto',
        }}
      >
        <Typography variant="h3" fontWeight="bold" textAlign="center">
          🌱 A Trusted Partner in Freshness and Quality
        </Typography>
        <Typography variant="h6" textAlign="center" fontWeight="normal">
          Over Hundreds of Businesses Across Vancouver Trust Supreme Sprouts
        </Typography>

        <Grid container columnSpacing={2} rowGap={4} mt={4}>
          {trustedList.map((trusted: TrustedType, index: number) => {
            return (
              <Grid
                item
                xs={12}
                md={6}
                key={index}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <TrustedCard trusted={trusted} />
              </Grid>
            );
          })}
        </Grid>
      </Box>

    </Box>
  );
}
