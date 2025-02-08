import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import Logo from './Logo';

export default function Footer() {
  return (
    <Grid container alignItems="center" rowGap={4} sx={{ py: 8, px: 8 }}>
      <Grid item xs={12} md={6} textAlign="right">
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Logo />
          <Typography variant="h5" fontWeight="bold">
            Supreme Sprouts Ltd.
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={4}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" fontWeight="bold">
              Company
            </Typography>
            <Typography variant="h6" fontWeight="normal">
              About us
            </Typography>
            <Typography variant="h6" fontWeight="normal">
              Join us
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" fontWeight="bold">
              Product
            </Typography>
            <Typography variant="h6" fontWeight="normal">
              Best Seller
            </Typography>
            <Typography variant="h6" fontWeight="normal">
              Listing
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
