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
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IPaymentMethod } from '@/app/utils/type';
import { API_URL, PAYMENT_METHOD_TYPE } from '@/app/utils/enum';
import axios from 'axios';
import moment from 'moment';
import { methodTypes } from '@/app/lib/constant';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddPaymentMethod({
  open,
  onClose,
  showNotification,
}: IProps) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<IPaymentMethod>({
    id: -1,
    name: '',
    type: PAYMENT_METHOD_TYPE.CASH,
    transactions: [],
    balance: 0,
    createdAt: '',
    createdBy: '',
    updatedBy: null,
    updatedAt: null,
  });

  const onChangePaymentMethod = (field: string, value: any) => {
    setNewPaymentMethod({
      ...newPaymentMethod,
      [field]: value,
    });
  };

  const handleAddPaymentMethod = async () => {
    setIsAdding(true);
    try {
      const createdAt = new Date();
      const dateString = moment(createdAt).format('YYYY-MM-DD');
      const timeString = moment(createdAt).format('HH:mm:ss');

      const response = await axios.post(`${API_URL.ADMIN}/paymentMethods`, {
        name: newPaymentMethod.name,
        type: newPaymentMethod.type,
        createdAt: `${timeString} ${dateString}`,
        balance: newPaymentMethod.balance,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setNewPaymentMethod({
        id: -1,
        name: '',
        type: PAYMENT_METHOD_TYPE.CASH,
        transactions: [],
        balance: 0,
        createdAt: '',
        createdBy: '',
        updatedBy: null,
        updatedAt: null,
      });

      setIsAdding(false);
    } catch (error: any) {
      console.log('Fail to add payment method: ', error);
      showNotification('error', 'Fail to add payment method: ' + error);
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Payment Method"
          buttonLabel="ADD"
          onClose={onClose}
          buttonProps={{ loading: isAdding }}
          onClick={handleAddPaymentMethod}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Name</Typography>
            <TextField
              value={newPaymentMethod.name}
              onChange={(e) => onChangePaymentMethod('name', e.target.value)}
              fullWidth
              placeholder="Enter payment method name..."
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Type</Typography>
            <Select
              value={newPaymentMethod.type}
              onChange={(e) => onChangePaymentMethod('type', e.target.value)}
              size="small"
            >
              {methodTypes.map((method: PAYMENT_METHOD_TYPE) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
