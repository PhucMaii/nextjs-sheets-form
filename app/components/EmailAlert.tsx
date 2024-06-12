import {
  Alert,
  Box,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import { API_URL } from '../utils/enum';
import { Notification } from '../utils/type';
import { LoadingButton } from '@mui/lab';
import { UserContext } from '../context/UserContextAPI';

interface PropTypes {
  setIsOpenSnackbar: (bool: boolean) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function EmailAlert({
  setIsOpenSnackbar,
  setNotification,
}: PropTypes) {
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { mutate } = useContext(UserContext);

  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const subscribeEmail = async () => {
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

      setIsSubmitting(false);
      setIsOpenSnackbar(false);
      mutate();
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to subscribe email: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to subscribe email: ' + error,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Alert
        severity="warning"
        sx={{
          width: '100%',
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
        onClose={smDown ? () => setIsOpenSnackbar(false) : undefined}
      >
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Typography>
            Subscribe your email to acknowledge whenever your order is placed:
          </Typography>
          <TextField
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <LoadingButton
            disabled={email.trim() === '' || !email.includes('@')}
            loading={isSubmitting}
            onClick={subscribeEmail}
          >
            Submit
          </LoadingButton>
        </Box>
      </Alert>
    </>
  );
}
