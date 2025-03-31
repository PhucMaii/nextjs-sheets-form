'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { SplashScreen } from '../../HOC/AuthenGuard';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ShadowSection } from '../admin/reports/styled';
import axios from 'axios';
import { API_URL } from '../utils/enum';
import { signOut, useSession } from 'next-auth/react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import useNotification from '@/hooks/useNotification';
import { LogOutIcon } from 'lucide-react';

export default function AccountPage() {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [passwordGroup, setPasswordGroup] = useState<any>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { showNotification, NotificationComp } = useNotification();

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
        showNotification('error', response.data.error);
        setIsFetching(false);
        return;
      }

      setEmail(response.data.data.email || '');
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client email: ', error);

      showNotification('error', 'Fail to fetch client email: ' + error);
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
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update client email: ', error);

      showNotification('error', 'Fail to update client email: ' + error);
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { isValid, message } = checkPasswordInput();
    if (!isValid) {
      showNotification('error', message);
      return;
    }

    try {
      setIsSubmitting(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...submittedData } = passwordGroup;
      const response = await axios.put(API_URL.USER, submittedData);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('Fail to update user password: ', error);

      showNotification('error', error.response.data.error);
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
      {NotificationComp}
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
          <LoadingButton
            variant="contained"
            onClick={handleUpdateEmail}
            loading={isSubmitting}
            fullWidth={smDown}
          >
            Save
          </LoadingButton>
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
          <LoadingButton
            variant="contained"
            loading={isSubmitting}
            fullWidth={smDown}
            onClick={handleUpdatePassword}
          >
            Update
          </LoadingButton>
        </Box>
      </ShadowSection>

      <ShadowSection>
        <Typography variant="h5" fontWeight="bold">
          Sign out
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() =>
            signOut({
              callbackUrl: `https://www.supremesprouts.com/auth/login`,
            })
          }
        >
          <Box display="flex" alignItems="center" gap={1}>
            <LogOutIcon />
            <Typography>Sign out</Typography>
          </Box>
        </Button>
      </ShadowSection>
      {/* </AuthenGuard> */}
    </Sidebar>
  );
}
