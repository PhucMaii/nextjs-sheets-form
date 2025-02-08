import { landingPagePrimaryColor } from '@/constant/landingPage';
import useCart from '@/hooks/useCart';
import { LoadingButton } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function OrderSummary() {
  const router = useRouter();

  // const cart = useSelector((state: RootState) => state.cart);
  const { renderDisplayTotal } = useCart();

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  // useEffect(() => {
  //   if (!address.fullName) {
  //     dispatch(
  //       updateCartAsync({
  //         cartId: cart.id,
  //         updatedData: {
  //           shippingFee: 0,
  //         },
  //     }))
  //     return;
  //   }
  // }, [address]);

  // const onCalculateShippingFee = async () => {
  //   try {
  //     setIsLoading(true);
  //     const latLng: any = await generateLatLng(address.fullName);

  //     const distance = calculateDistance(
  //       latLng.latitude,
  //       latLng.longitude,
  //       homeLat,
  //       homeLng,
  //     );

  //     const shippingFee = calculateShippingFee(distance);

  //     dispatch(
  //       updateCartAsync({
  //         cartId: cart.id,
  //         updatedData: {
  //           shippingFee,
  //         },
  //       }),
  //     );
  //   } catch (error: any) {
  //     console.log('Fail to calculate shipping fee', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const onDataReceived = useCallback((data: any) => {
  //   if (!data) {
  //     return;
  //   }

  //   console.log(data, 'data');

  //   setAddress((prevState: any) => {
  //     return {
  //       ...prevState,
  //       address: `${data.terms[0]?.value} ${data.terms[1]?.value}`,
  //       city: `${data.terms[2]?.value}`,
  //       fullName: data.description,
  //     };
  //   });
  // }, []);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography
        textAlign="center"
        variant="h5"
        fontWeight="bold"
        sx={{ color: landingPagePrimaryColor }}
      >
        Order Summary
      </Typography>

      {/* {renderAddressInput()} */}

      {renderDisplayTotal()}

      <LoadingButton onClick={proceedToCheckout} variant="contained" fullWidth>
        {/* TODO: will be changed to checkout */}
        Place order
      </LoadingButton>
      <Typography variant="subtitle2" sx={{ color: grey[500] }}>
        * Shipping fee will be calculated at checkout
      </Typography>
    </Box>
  );
}
