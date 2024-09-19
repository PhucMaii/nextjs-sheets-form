import {
  Alert,
  AlertColor,
  Box,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import React, { useContext, useState } from 'react';
import { API_URL } from '../utils/enum';
import { LoadingButton } from '@mui/lab';
import { UserContext } from '../context/UserContextAPI';

interface PropTypes {
  setIsOpenSnackbar: (bool: boolean) => void;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EmailAlert({
  setIsOpenSnackbar,
  showNotification,
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
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsOpenSnackbar(false);
      mutate();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to subscribe email: ', error);
      showNotification('error', 'Fail to subscribe email: ' + error);
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
