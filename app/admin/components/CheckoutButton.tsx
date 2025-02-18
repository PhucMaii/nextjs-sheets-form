import useCart from '@/hooks/useCart';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CheckoutClientData } from '@/pages/api/stripe';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import React, { useState } from 'react';

interface IProps {
  style?: any;
  deliveryDate: string;
  clientData: any;
}

export const onStripePayment = async (
  cartId: number,
  deliveryDate: string,
  clientData: CheckoutClientData,
) => {
  try {
    const response = await axios.post('/api/stripe', {
      cartId,
      deliveryDate,
      clientData,
      guestSessionId: clientData.guestSessionId,
      guestSessionSignature: clientData.guestSessionSignature,
    });

    window.location.href = response.data.url;
  } catch (error: any) {
    console.log('Fail to create checkout session: ', error);
  }
};

export default function CheckoutButton({
  style,
  deliveryDate,
  clientData,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [guestSession] = useLocalStorage('guest-session', '');

  const { cart } = useCart();

  const onPayment = async () => {
    setIsLoading(true);
    try {
      await onStripePayment(cart.id, deliveryDate, {
        ...clientData,
        guestSessionId: guestSession.sessionId,
        guestSessionSignature: guestSession.signature,
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to create checkout session: ', error);
      setIsLoading(false);
    }
  };

  return (
    <LoadingButton variant="contained" fullWidth onClick={onPayment} loading={isLoading} {...style}>
      Checkout
    </LoadingButton>
  );
}
