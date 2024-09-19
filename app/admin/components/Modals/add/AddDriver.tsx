import { AlertColor, Divider, Grid, Modal, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function AddDriver({
  open,
  onClose,
  showNotification,
  mutateDrivers,
}: IProps) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleAddDriver = async () => {
    try {
      setIsAdding(true);

      const response = await axios.post(`${API_URL.ADMIN}/drivers`, {
        driverName: name.toUpperCase(),
        driverPassword: password,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      mutateDrivers();

      showNotification('success', response.data.message);
      setIsAdding(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', `There was an error ${error.response.data.error}`);
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Driver"
          buttonLabel="Add"
          onClick={handleAddDriver}
          buttonProps={{ loading: isAdding }}
          onClose={onClose}
        />
        <Divider sx={{ my: 2 }} />

        <Grid container rowGap={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>Name:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              label="Name"
              placeholder="Enter driver name..."
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography>Password:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              label="Password"
              placeholder="Enter driver password..."
              fullWidth
            />
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}

