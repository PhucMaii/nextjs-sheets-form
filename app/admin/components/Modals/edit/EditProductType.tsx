import { AlertColor, Divider, Modal, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IItemType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
// import SelectIcons from '../../Select/SelectIcons';

interface IProps extends ModalProps {
  type: IItemType | null;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditProductType({
  open,
  onClose,
  type,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedType, setUpdatedType] = useState<any>(type);

  useEffect(() => {
    if (type) {
      setUpdatedType(type);
    }
  }, [type]);

  const handleUpdateProductType = async () => {
    if (!type) {
      showNotification('error', 'Product Type Not Found');
      return;
    }
    if (!updatedType.name || updatedType.name.trim() === '') {
      showNotification('error', 'Product Type Name is required');
      return;
    }
    // if (updatedType.name === type?.name) {
    //   showNotification('error', 'Product Type Name Does Not Change');
    //   return;
    // }

    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/productTypes`, {
        id: type?.id,
        name: updatedType.name,
        icon: updatedType?.icon,
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
          heading={'Edit Product Type' + ' - ' + type?.name}
          buttonLabel="EDIT"
          onClick={handleUpdateProductType}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        {/* <SelectIcons
          selectedIcon={updatedType?.icon}
          setSelectedIcon={(newValue: string) =>
            setUpdatedType((prevState: any) => ({
              ...prevState,
              icon: newValue,
            }))
          }
        /> */}

        <TextField
          label="Product Type Name"
          variant="outlined"
          fullWidth
          value={updatedType?.name || ''}
          onChange={(e) =>
            setUpdatedType((prevState: any) => ({
              ...prevState,
              name: e.target.value,
            }))
          }
        />
      </BoxModal>
    </Modal>
  );
}
