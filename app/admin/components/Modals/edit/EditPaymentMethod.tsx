import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import {
  AlertColor,
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IPaymentMethod } from '@/app/utils/type';
import { API_URL, PAYMENT_METHOD_TYPE } from '@/app/utils/enum';
import axios from 'axios';
import { generateCurrentTime } from '@/app/utils/time';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  paymentMethod: IPaymentMethod | null;
  setCurrentPaymentMethod: any;
  mutateMethod: any;
}

export default function EditPaymentMethod({
  open,
  onClose,
  showNotification,
  paymentMethod,
  setCurrentPaymentMethod,
  mutateMethod
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedPaymentMethod, setUpdatedPaymentMethod] =
    useState<IPaymentMethod | null>(paymentMethod);

  useEffect(() => {
    setUpdatedPaymentMethod(paymentMethod);
  }, [paymentMethod]);

  const onChangeMethod = (field: string, value: any) => {
    if (!updatedPaymentMethod) return null;

    setUpdatedPaymentMethod({
      ...updatedPaymentMethod,
      [field]: value,
    });
  };

  const handleUpdateMethod = async () => {
    setIsLoading(true);
    try {
        const currentTime = generateCurrentTime();
        const response = await axios.put(`${API_URL.ADMIN}/paymentMethods`, {
            updatedData: {
                name: updatedPaymentMethod?.name, 
                type: updatedPaymentMethod?.type
            }, 
            methodId: updatedPaymentMethod?.id, 
            updatedAt: currentTime
        });

        if (response.data.error) {
            showNotification('error', response.data.error);
            setIsLoading(false);
            return;
        }

        // Update Real Data
        setCurrentPaymentMethod(updatedPaymentMethod);
        mutateMethod();

        showNotification('success', response.data.message);
        onClose();
        setIsLoading(false);
    } catch (error: any) {
        console.log('Fail to update payment method: ', error);
        showNotification(
          'error',
          'Fail to update payment method: ' + error.response.data.error,
        );
        setIsLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Edit Payment Method"
          buttonLabel="EDIT"
          onClick={handleUpdateMethod}
          buttonProps={{loading: isLoading}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection={'column'} gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Name</Typography>
            <TextField
              value={updatedPaymentMethod?.name}
              onChange={(e) => onChangeMethod('name', e.target.value)}
              placeholder="Enter new name..."
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Type</Typography>
            <Select
              value={updatedPaymentMethod?.type}
              onChange={(e) => onChangeMethod('type', e.target.value)}
            >
              <MenuItem value={PAYMENT_METHOD_TYPE.CASH}>
                {PAYMENT_METHOD_TYPE.CASH}
              </MenuItem>
              <MenuItem value={PAYMENT_METHOD_TYPE.CREDIT}>
                {PAYMENT_METHOD_TYPE.CREDIT}
              </MenuItem>
              <MenuItem value={PAYMENT_METHOD_TYPE.DEBIT}>
                {PAYMENT_METHOD_TYPE.DEBIT}
              </MenuItem>
            </Select>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
