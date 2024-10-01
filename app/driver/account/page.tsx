'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Box,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';

export default function AccountPage() {
  const [passwordGroup, setPasswordGroup] = useState<any>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const { showNotification, NotificationComp } = useNotification();
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

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

  const handleChangePasswordGroup = (key: string, value: string) => {
    setPasswordGroup({ ...passwordGroup, [key]: value });
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
      const response = await axios.put(API_URL.DRIVER, submittedData);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }
      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Typography variant="h5" textAlign="center">
        Account
      </Typography>
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
    </Sidebar>
  );
}
