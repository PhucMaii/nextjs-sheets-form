'use client';
import React, { useEffect, useState } from 'react';
import NavbarWrapper from '../lib/NavbarWrapper';
import { Box, Button, Grid, Typography } from '@mui/material';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { ShadowSection } from '../admin/reports/styled';
import useLocalStorage from '@/hooks/useLocalStorage';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { ICart, ICartItem } from '../utils/type';
import { ShoppingBagIcon } from 'lucide-react';
import CheckoutItem from '../components/CartPage/CheckoutItem';

export default function CartPage() {
  const [cart, setCart] = useState<ICart | null>(null);
  const [cartId, setCartId] = useLocalStorage('cartId', '');

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    if (cartId) {
      fetchCart();
    }
  }, [cartId]);

  const fetchCart = async () => {
    try {
      const ipAddress: any = await axios.get(
        'https://api.ipify.org?format=json',
      );
      const response = await axios.get(
        `${API_URL.PUBLIC}/cart?cartId=${cartId}&ipAddress=${ipAddress.ip}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setCart(response.data.data);
      setCartId(response.data.data.id);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        error?.response?.data?.error ||
          'Something went wrong. Please try again later',
      );
    }
  };

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
        {cart?.items &&
          cart.items.length > 0 &&
          cart.items.map((item: ICartItem, index: number) => {
            return <CheckoutItem item={item} key={index} />;
          })}
      </Grid>
    );
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
          sx={{
            width: 'fit-content',
            backgroundColor: landingPagePrimaryColor,
            '&:hover': { backgroundColor: landingPageSecondaryColor },
          }}
        >
          Back Home
        </Button>
      </Box>
    );
  };

  const renderOrderSummary = () => {
    return (
      <>
        <Typography
          textAlign="center"
          variant="h5"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          Order Summary
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} mt={4}>
          {cart && cart?.discount > 0 && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography>Discount: </Typography>
              <Typography>${cart.discount.toFixed(2)} </Typography>
            </Box>
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Subtotal: </Typography>
            <Typography>${cart?.subtotal?.toFixed(2)} </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>PST (7%): </Typography>
            <Typography>${cart?.PST?.toFixed(2)} </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>GST (5%): </Typography>
            <Typography>${cart?.GST?.toFixed(2)} </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5">Total: </Typography>
            <Typography variant="h5">
              ${cart?.totalPrice?.toFixed(2)}{' '}
            </Typography>
          </Box>
        </Box>
      </>
    );
  };

  if (!cart) {
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
            <ShadowSection>{renderDisplayCartItems()}</ShadowSection>
          </Grid>
          <Grid item xs={12} md={4}>
            <ShadowSection>
              {renderOrderSummary()}
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
