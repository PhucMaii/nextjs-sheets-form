import { AlertColor, Divider, Modal, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IProductType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  type: IProductType | null;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditProductType({
  open,
  onClose,
  type,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(type?.name || '');

  useEffect(() => {
    if (type) {
      setNewName(type.name);
    }
  }, [type]);

  const handleUpdateProductType = async () => {
    if (!type) {
      showNotification('error', 'Product Type Not Found');
      return;
    }
    if (!newName || newName.trim() === '') {
      showNotification('error', 'Product Type Name is required');
      return;
    }
    if (newName === type?.name) {
      showNotification('error', 'Product Type Name Does Not Change');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/productTypes`, {
        id: type?.id,
        name: newName,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error.response.data.error,
      );

      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading={"Edit Product Type" + ' - ' + type?.name}
          buttonLabel="EDIT"
          onClick={handleUpdateProductType}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Product Type Name"
          variant="outlined"
          fullWidth
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </BoxModal>
    </Modal>
  );
}
