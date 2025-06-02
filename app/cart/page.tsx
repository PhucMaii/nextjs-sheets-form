'use client';
import React, { useEffect } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, Button, Grid, Typography } from '@mui/material';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';
import useNotification from '@/hooks/useNotification';
import { ShoppingBagIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import CartItemTable from '@/app/components/CartPage/CartItemTable';
import { useRouter } from 'next/navigation';
import OrderSummary from '@/app/components/CartPage/OrderSummary';
import { ArrowBack } from '@mui/icons-material';
import { maxWidth } from '@/app/lib/constant';
import { fetchApi } from '../utils/db';
import { updateCart } from '@/state/cart/cartSlice';

export default function CartPage() {
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchCart();
  }, []);

  const goToProductsPage = () => {
    router.push('/products');
  };

  const fetchCart = async () => {
    const data = await fetchApi('/api/public/cart');

    if (data) {
      dispatch(updateCart(data));
    }
  };

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
          mb: 4,
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

  if (!cart || (cart as any).items.length === 0) {
    return <NavbarWrapper>{renderEmptyCart()}</NavbarWrapper>;
  }

  return (
    <NavbarWrapper>
      {NotificationComp}
      <Box sx={{ maxWidth: maxWidth, mx: 'auto', width: '100%', p: 4 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          Your cart
        </Typography>
        <Grid container columnSpacing={2} rowGap={2} mt={2} sx={{ width: '100%' }}>
          <Grid item xs={12} md={8}>
            <ShadowSection>
              <CartItemTable showNotification={showNotification} />
            </ShadowSection>
            <Button
              sx={{
                backgroundColor: landingPagePrimaryColor,
                color: 'white',
                mt: 4,
              }}
              variant="contained"
              onClick={goToProductsPage}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <ArrowBack />
                <Typography fontWeight="bold">Back to Shopping</Typography>
              </Box>
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShadowSection>
              <OrderSummary showNotification={showNotification} />
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
