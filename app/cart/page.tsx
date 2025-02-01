'use client';
import React from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, Button, Grid, Typography } from '@mui/material';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { ShadowSection } from '../admin/reports/styled';
import useNotification from '@/hooks/useNotification';
import { ShoppingBagIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/state/store';
import CartItemTable from '../components/CartPage/CartItemTable';
import { useRouter } from 'next/navigation';
import OrderSummary from '../components/CartPage/OrderSummary';

export default function CartPage() {
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart);

  const { showNotification, NotificationComp } = useNotification();

  const goToProductsPage = () => {
    router.push('/products');
  }

  const renderEmptyCart = () => {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        gap={2}
        sx={{
          paddingTop: '150px',
        }}
      >
        <ShoppingBagIcon
          style={{
            color: landingPagePrimaryColor,
            width: '50px',
            height: '50px',
          }}
        />
        <Typography
          variant="h5"
          textAlign="center"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          Your cart is empty
        </Typography>
        <Button
          variant="contained"
          onClick={goToProductsPage}
          sx={{
            width: 'fit-content',
            backgroundColor: landingPagePrimaryColor,
            '&:hover': { backgroundColor: landingPageSecondaryColor },
          }}
        >
          Back To Shopping
        </Button>
      </Box>
    );
  };

  if (!cart || cart.items.length === 0) {
    return (
      <NavbarWrapper setIsOpenSignUp={() => {}}>
        {renderEmptyCart()}
      </NavbarWrapper>
    );
  }

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
      {NotificationComp}
      <Box sx={{ maxWidth: '1500px', mx: 'auto', p: 4 }}>
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
              <CartItemTable 
                showNotification={showNotification}
              />
            </ShadowSection>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShadowSection>
              <OrderSummary />
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
