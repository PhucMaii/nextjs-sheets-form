import {
  AlertColor,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  sendInvoice: any;
  email: string;
  userId: number;
}

export default function EditEmail({
  open,
  onClose,
  showNotification,
  sendInvoice,
  email,
  userId,
}: IProps) {
  const { companyId }: any = useParams();
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
        const response = await axios.put(
          getAdminApiUrl(companyId, '/clients'),
          {
            userId,
            email: updatedEmail,
          },
        );

        if (response.data.error) {
          showNotification('error', response.data.error);
          return;
        }
      }

      await sendInvoice(updatedEmail);
      setIsLoading(false);
    } catch (error: any) {
      showNotification(
        'error',
        'Fail to send statement: ' + error?.response?.data?.error,
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Email"
          buttonLabel="Send"
          onClick={handleSubmit}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Typography>Email</Typography>
        <TextField
          sx={{ mt: 1 }}
          placeholder="Enter email here..."
          value={updatedEmail}
          onChange={(e: any) => setUpdatedEmail(e.target.value)}
          fullWidth
        />
      </BoxModal>
    </Modal>
  );
}
