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

export default function CartPage() {
  // const [cart, setCart] = useState<ICart | null>(null);
  // const [cartId, setCartId] = useLocalStorage('cartId', '');

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
              {renderOrderSummary()}
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </NavbarWrapper>
  );
}
