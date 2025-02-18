import { API_URL, USER_CATEGORIZED } from '@/app/utils/enum';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import useCart from '@/hooks/useCart';
import {
  AlertColor,
  Box,
  Button,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import RequestToJoinModal from '../Modals/RequestToJoinModal';
import useDatePicker from '@/hooks/useDatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { updateUser } from '@/state/user/userSlice';
import { LoadingButton } from '@mui/lab';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
}

type ClientInfo = {
  clientName: string;
  deliveryAdress: string;
  contactNumber: string;
  email: string;
  guestSessionId: string;
  guestSessionSignature: string;
};

export default function OrderSummary({ showNotification }: IProps) {
  const [isOpenJoinModal, setIsOpenJoinModal] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const router = useRouter();

  // const cart = useSelector((state: RootState) => state.cart);
  const { cart, renderDisplayTotal } = useCart();
  const user = useSelector((state: RootState) => state.user);

  const dispatch = useDispatch<AppDispatch>();
  const { renderDatePicker, deliveryDate } = useDatePicker(0);

  const onPlaceOrder = async (clientInfo: ClientInfo) => {
    if (!deliveryDate) {
      showNotification('error', 'Please select delivery date');
      return;
    }
    try {
      const response = await axios.post(`${API_URL.PUBLIC}/place-order`, {
        cartId: cart?.id,
        userId: cart?.userId,
        client: clientInfo,
        guestSessionId: clientInfo.guestSessionId,
        deliveryDate,
        note,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      dispatch(updateUser(response.data.data.user));
    } catch (error: any) {
      console.log(
        'Fail to place order: ',
        error?.response?.data?.error || error,
      );
      showNotification(
        'error',
        'Fail to place order: ' + error?.response?.data?.error || error,
      );
    }
  };

  const proceedToLoginPage = () => {
    router.push('/login');
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  const renderOrderInfo = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6" fontWeight="bold">
            Delivery Date
          </Typography>
          {renderDatePicker()}
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6" fontWeight="bold">
            Note
          </Typography>
          <TextField
            placeholder="Leave note for us..."
            rows={2}
            multiline
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <RequestToJoinModal
        open={isOpenJoinModal}
        onClose={() => setIsOpenJoinModal(false)}
        onClick={onPlaceOrder}
      />
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

        <Divider>Other Information</Divider>
        {renderOrderInfo()}
        {user?.id > 0 ? (
          <>
            <Button variant="contained" onClick={proceedToLoginPage}>
              Login To Our Partner Portal
            </Button>
            <Typography variant="subtitle2" sx={{ color: grey[500] }}>
              * If you do not have an account yet, please wait some time and our
              team will contact you. Once you have an account, you can login to
              our partner portal. No upfront payment required for our partner.
            </Typography>
          </>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={() => setIsOpenJoinModal(true)}
            >
              Place Order & Be Our Partner
            </Button>
            <Typography variant="subtitle2" sx={{ color: grey[500] }}>
              * Partner with us and no upfront payment required. Receive your
              products first and pay later.
            </Typography>
            {user.type === USER_CATEGORIZED.GUEST && (
              <>
                <Divider>Or</Divider>
                <LoadingButton
                  onClick={proceedToCheckout}
                  variant="outlined"
                  fullWidth
                >
                  Go to checkout
                </LoadingButton>
              </>
            )}
          </>
        )}
      </Box>
    </>
  );
}
