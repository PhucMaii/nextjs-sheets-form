import { AlertColor, Divider, Modal, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  sendInvoice: any;
  email: string;
  userId: number
}

export default function EditEmail({open, onClose, showNotification, sendInvoice, email, userId}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedEmail, setUpdatedEmail] = useState<string>(email);

  useEffect(() => {
    if (email) {
      setUpdatedEmail(email);
    }
  }, [email]);
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      // Update email
      if (updatedEmail !== email) {
        const response = await axios.put(`${API_URL.ADMIN}/clients`, {userId, email: updatedEmail});
  
        if (response.data.error) {
          showNotification('error', response.data.error);
          return;
        };
      }

      await sendInvoice(updatedEmail);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Fail to send statement: ' + error?.response?.data?.error);
    }
  }

  // const handleSendInvoice = async () => {
  //   try {
  //     const response = await axios.post(`${API_URL.ADMIN}/sendInvoicePdf`, {
  //       client: clientValue,
  //       orders: selectedOrders.length > 0 ? selectedOrders : clientOrders,
  //       endDate: dateRange[1],
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       return;
  //     }

  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('There was an error: ', error);
  //     showNotification(
  //       'error',
  //       'There was an error: ' + error.response.data.error,
  //     );
  //   }
  // };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead 
          heading="Edit Email"
          buttonLabel='Send'
          onClick={handleSubmit}
          buttonProps={{loading: isLoading}}
          onClose={onClose}
        />

        <Divider sx={{my: 2}} />

        <Typography>Email</Typography>
        <TextField
          sx={{mt: 1}}
          placeholder='Enter email here...'
          value={updatedEmail}
          onChange={(e: any) => setUpdatedEmail(e.target.value)}
          fullWidth
        />
      </BoxModal>
    </Modal>
  )
}
