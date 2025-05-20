'use client';
import React, { useState } from 'react';
import NavbarWrapper from '../../lib/NavbarWrapper';
import { Box, Button, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { updateUser } from '@/state/user/userSlice';
import { CheckCircle } from 'lucide-react';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
  maxWidth,
} from '@/constant/landingPage';
import { useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { USER_CATEGORIZED } from '../../utils/enum';
import Link from 'next/link';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';

export default function ApplicatinForm() {
  const [clientInfo, setClientInfo] = useState<any>({
    name: '',
    email: '',
    contactNumber: '',
    contactName: '',
    deliveryAddress: '',
    message: '',
  });
  const [guestSession] = useLocalStorage('guest-session', {});

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  const { showNotification, NotificationComp } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const onSendRequest = async () => {
    if (
      !clientInfo.name ||
      !clientInfo.contactName ||
      !clientInfo.email ||
      !clientInfo.contactNumber ||
      !clientInfo.deliveryAddress
    ) {
      showNotification('error', 'Please fill all the fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/signup', {
        ...clientInfo,
        guestSessionId: guestSession.sessionId,
        guestSessionSignature: guestSession.signature,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
      dispatch(updateUser(response.data.data.user));
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error?.response?.data?.error || error,
      );
      setIsLoading(false);
      return;
    }
  };

  const renderAlreadyAppliedMsg = () => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
        alignItems="center"
        justifyContent="center"
        mt={6}
      >
        <CheckCircle
          style={{
            color: landingPagePrimaryColor,
            width: '80px',
            height: '80px',
          }}
        />
        <Typography variant="h4" sx={{ }}>
          Thank you for applying to join Supreme Sprouts Ltd.
        </Typography>
        <Typography
          variant="h6"
          fontWeight="normal"
          sx={{ }}
        >
          Our team will contact you shortly to provide you with more
          information.
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: landingPagePrimaryColor,
            '&:hover': { backgroundColor: landingPageSecondaryColor },
          }}
          onClick={() => router.push('/products')}
        >
          Back to shopping
        </Button>
      </Box>
    );
  };

  if (user?.type === USER_CATEGORIZED.PENDING) {
    return <NavbarWrapper>{renderAlreadyAppliedMsg()}</NavbarWrapper>;
  }

  return (
    <NavbarWrapper>
      {NotificationComp}
      <Box sx={{ maxWidth: maxWidth, mx: 'auto', py: 4 }}>
        <ShadowSection
          sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            justifyContent="center"
          >
            <Typography textAlign="center" variant="h3">
              Welcome To Supreme Sprouts! 👋
            </Typography>
            <Typography textAlign="center" variant="h5" fontWeight="normal">
              Here Is Your First Step To Grow Your Business
            </Typography>
            <Typography textAlign="center" variant="h5" fontWeight="bold">
              Create Your Account
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Company Name</Typography>
              <TextField
                size="small"
                type="text"
                placeholder="Please enter your company name..."
                value={clientInfo.name}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    name: e.target.value,
                  }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Main Contact Name</Typography>
              <TextField
                size="small"
                type="text"
                placeholder="Please enter your main contact name..."
                value={clientInfo.contactName}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    contactName: e.target.value,
                  }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Email</Typography>
              <TextField
                size="small"
                type="text"
                placeholder="Please enter your email..."
                value={clientInfo.email}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    email: e.target.value,
                  }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Contact Number</Typography>
              <TextField
                size="small"
                type="number"
                placeholder="Please enter your contact number..."
                value={clientInfo.contactNumber}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    contactNumber: e.target.value,
                  }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Address</Typography>
              <TextField
                size="small"
                type="text"
                placeholder="Please enter your address..."
                value={clientInfo.deliveryAddress}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    deliveryAddress: e.target.value,
                  }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Message (Optional)</Typography>
              <TextField
                size="small"
                multiline
                rows={2}
                type="text"
                placeholder="Please enter your message..."
                value={clientInfo.message}
                onChange={(e: any) =>
                  setClientInfo((prevState: any) => ({
                    ...prevState,
                    message: e.target.value,
                  }))
                }
              />
            </Box>

            <Typography sx={{ color: grey[600] }}>
              * We are excited to have you on board! Please note that our team
              will reach out to you within 24 hours to assist you. Thank you. *
            </Typography>

            <LoadingButton
              onClick={onSendRequest}
              loading={isLoading}
              variant="contained"
            >
              Submit
            </LoadingButton>

            <Link href="/account/login">
              <Typography textAlign="center">
                Already have an account? Login here
              </Typography>
            </Link>
          </Box>
        </ShadowSection>
      </Box>
    </NavbarWrapper>
  );
}
