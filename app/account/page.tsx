'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import AuthenGuard, { SplashScreen } from '../HOC/AuthenGuard';
import {
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ShadowSection } from '../admin/reports/styled';
import { infoColor } from '../theme/color';
import { Notification } from '../utils/type';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { useSession } from 'next-auth/react';
import LoadingButtonStyles from '../components/LoadingButtonStyles';
import SnackbarPopup from '../components/Snackbar/SnackbarPopup';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function AccountPage() {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [passwordGroup, setPasswordGroup] = useState<any>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: session }: any = useSession();

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    if (session) {
      fetchClientEmail();
    }
  }, [session]);

  const checkPasswordInput = () => {
    if (
      !passwordGroup.oldPassword ||
      !passwordGroup.newPassword ||
      !passwordGroup.confirmPassword
    ) {
      return {
        isValid: false,
        message: 'All password fields need to be filled out',
      };
    }

    if (passwordGroup.confirmPassword !== passwordGroup.newPassword) {
      return { isValid: false, message: 'Confirm password does not match' };
    }

    return { isValid: true, message: '' };
  };

  const fetchClientEmail = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(
        `${API_URL.USER}?id=${session?.user?.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      setEmail(response.data.data.email || '');
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client email: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to fetch client email: ' + error,
      });
      setIsFetching(false);
    }
  };

  const handleChangePasswordGroup = (key: string, value: string) => {
    setPasswordGroup({ ...passwordGroup, [key]: value });
  };

  const handleUpdateEmail = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.put(API_URL.USER, { email });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsSubmitting(false);
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update client email: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update client email: ' + error,
      });
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { isValid, message } = checkPasswordInput();
    if (!isValid) {
      setNotification({
        on: true,
        type: 'error',
        message,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...submittedData } = passwordGroup;
      const response = await axios.put(API_URL.USER, submittedData);

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsSubmitting(false);
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update user password: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <Sidebar>
        <SplashScreen />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <AuthenGuard>
        <SnackbarPopup
          open={notification.on}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, on: false })}
        />
        <Typography variant="h4">Account</Typography>
        <ShadowSection display="flex" flexDirection="column" gap={2} mt={2}>
          <Typography variant="h5" fontWeight="bold">
            General Information
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Email</Typography>
            <TextField
              fullWidth
              placeholder="New email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box display="flex" justifyContent="right">
            <LoadingButtonStyles
              onClick={handleUpdateEmail}
              color={infoColor}
              loading={isSubmitting}
              fullWidth={smDown}
            >
              Save
            </LoadingButtonStyles>
          </Box>
        </ShadowSection>
        <ShadowSection display="flex" flexDirection="column" gap={2} mt={2}>
          <Typography variant="h5" fontWeight="bold">
            Security
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Current password</Typography>
            <OutlinedInput
              fullWidth
              id="old-password"
              type={showOldPassword ? 'text' : 'password'}
              onChange={(e) => {
                handleChangePasswordGroup('oldPassword', e.target.value);
              }}
              value={passwordGroup.oldPassword}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowOldPassword((show) => !show)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">New password</Typography>
            <OutlinedInput
              fullWidth
              id="new-password"
              type={showNewPassword ? 'text' : 'password'}
              onChange={(e) => {
                handleChangePasswordGroup('newPassword', e.target.value);
              }}
              value={passwordGroup.newPassword}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowNewPassword((show) => !show)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Confirm new password</Typography>
            <OutlinedInput
              fullWidth
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              onChange={(e) => {
                handleChangePasswordGroup('confirmPassword', e.target.value);
              }}
              value={passwordGroup.confirmPassword}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Box>
          <Box display="flex" justifyContent="right">
            <LoadingButtonStyles
              color={infoColor}
              loading={isSubmitting}
              fullWidth={smDown}
              onClick={handleUpdatePassword}
            >
              Update
            </LoadingButtonStyles>
          </Box>
        </ShadowSection>
      </AuthenGuard>
    </Sidebar>
  );
}
