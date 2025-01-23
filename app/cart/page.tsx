'use client';
import React from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, Button, Grid, Typography } from '@mui/material';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { ShadowSection } from '../admin/reports/styled';
import { green } from '@mui/material/colors';

export default function CartPage() {
  const renderDisplayCartItems = () => {
    return (
      // Header of the table
      <Grid container rowGap={4} columnSpacing={2} alignItems="center">
        <Grid item xs={6}>
          <Typography fontWeight="bold">Product</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Price</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Quantity</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography fontWeight="bold">Total Price</Typography>
        </Grid>

        {/* Body of the table */}
        <Grid item xs={6}>
          <Box display="flex" gap={2} alignItems="center">
            <img
              style={{ width: '150px', height: '100%', objectFit: 'contain' }}
              src="https://media.istockphoto.com/id/953466314/photo/mung-bean-sprouts-isolated-on-white-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=MUOVjJpE6C7wNJhEog0R9RQ1YKi9VoItCbzI_Hzyj70="
              alt=""
            />
            <Typography variant="h6">BEAN 5 LB</Typography>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h6" fontWeight="bold">
            $5.50
          </Typography>
        </Grid>
        <Grid item xs={2} textAlign="center">
          <Box display="flex" gap={1} alignItems="center">
            <Button
              variant="outlined"
              sx={{
                borderRadius: 1,
                width: '30px',
                height: '30px',
                p: 0,
                minWidth: 0,
                border: `1px solid ${green[800]}`,
                color: green[800],
                '&:hover': {
                    backgroundColor: green[50],
                    border: `1px solid ${green[800]}`
                }
              }}
            >
              -
            </Button>
            <Typography variant="h6" fontWeight="normal">
              2
            </Typography>
            <Button
              variant="outlined"
              sx={{
                borderRadius: 1,
                width: '30px',
                height: '30px',
                p: 0,
                minWidth: 0,
                border: `1px solid ${green[800]}`,
                color: green[800],
                '&:hover': {
                    backgroundColor: green[50],
                    border: `1px solid ${green[800]}`
                }
              }}
            >
              +
            </Button>
          </Box>
        </Grid>
        <Grid item xs={2}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: landingPagePrimaryColor }}
          >
            $11.00
          </Typography>
        </Grid>
      </Grid>
    );
  };

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
      <Box sx={{maxWidth: '1500px', mx: 'auto', p: 4}}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          Your cart
        </Typography>
        <Grid container columnSpacing={2} rowGap={2} mt={2}>
          <Grid item xs={12} md={8}>
            <ShadowSection>
              {renderDisplayCartItems()}
            </ShadowSection>
          </Grid>
          <Grid item xs={12} md={4}>
              <ShadowSection>
                <Typography textAlign="center" variant="h5" fontWeight="bold" sx={{color: landingPagePrimaryColor}}>
                  Order Summary
                </Typography>

                <Box display="flex" flexDirection="column" gap={2} mt={4}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>Discount: </Typography>
                    <Typography>$0.00 </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>Subtotal: </Typography>
                    <Typography>$11.00 </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>PST (7%): </Typography>
                    <Typography>$0.00 </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography>GST (5%): </Typography>
                    <Typography>$0.00 </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5">Total: </Typography>
                    <Typography variant="h5">$11.00 </Typography>
                  </Box>
                </Box>
              </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
