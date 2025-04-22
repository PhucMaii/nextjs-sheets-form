import useCart from '@/hooks/useCart';
import useLocalStorage from '@/hooks/useLocalStorage';
import { CheckoutClientData } from '@/pages/api/stripe';
import { AlertColor, LoadingButton } from '@mui/lab';
import axios from 'axios';
import React, { useState } from 'react';

interface IProps {
  style?: any;
  deliveryDate: string;
  clientData: any;
  showNotification: (type: AlertColor, message: string) => void;
}

export const onStripePayment = async (
  cartId: number,
  deliveryDate: string,
  clientData: CheckoutClientData,
) => {
  try {
    console.log({ clientData });
    const response = await axios.post('/api/stripe', {
      cartId,
      deliveryDate,
      clientData,
      guestSessionId: clientData.guestSessionId,
      guestSessionSignature: clientData.guestSessionSignature,
    });

    window.location.href = response.data.url;
    return { error: null };
  } catch (error: any) {
    console.log('Fail to create checkout session: ', error);
    return { error };
  }
};

export default function CheckoutButton({
  style,
  deliveryDate,
  clientData,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [guestSession] = useLocalStorage('guest-session', '');

  const { cart } = useCart();
  // const user = useSelector((state: RootState) => state.user);
  // const router = useRouter();

  const onPayment = async () => {
    setIsLoading(true);
    try {

      const { error } = await onStripePayment(cart.id, deliveryDate, {
        ...clientData,
        guestSessionId: guestSession.sessionId,
        guestSessionSignature: guestSession.signature,
      });

      if (error) {
        showNotification(
          'error',
          error?.response?.data?.error || 'Something went wrong',
        );
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to create checkout session: ', error);
      showNotification(
        'error',
        error?.response?.data?.error || 'Something went wrong',
      );
      setIsLoading(false);
    }
  };

  return (
    <LoadingButton
      variant="contained"
      fullWidth
      onClick={onPayment}
      loading={isLoading}
      style={{ ...style }}
    >
      Checkout
    </LoadingButton>
  );
}
