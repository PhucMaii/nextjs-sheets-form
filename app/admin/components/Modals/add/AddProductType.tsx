import { AlertColor, Divider, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddProductType({
  open,
  onClose,
  showNotification,
}: IProps) {
  const [newProductType, setNewProductType] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddProductType = async () => {
    if (!newProductType || newProductType.trim() === '') {
      showNotification('error', 'Product Type Name is required');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.ADMIN}/productTypes`, {
        name: newProductType,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);

      setIsLoading(false);
      return;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Product Type"
          buttonLabel="ADD"
          onClick={handleAddProductType}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Product Type"
          variant="outlined"
          fullWidth
          value={newProductType}
          onChange={(e) => setNewProductType(e.target.value)}
        />
      </BoxModal>
    </Modal>
  );
}
