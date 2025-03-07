import {
  AlertColor,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../Modals/styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryItem, IItemType } from '@/app/utils/type';
import { ModalProps } from '../Modals/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  types: IItemType[];
  item: IInventoryItem;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function SwitchTypeModal({
  open,
  onClose,
  item,
  types,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<number | null>(
    item?.typeId || null,
  );

  useEffect(() => {
    if (item) {
      setSelectedType(item.typeId);
    }
  }, [item]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/inventory/switch-type`,
        {
          id: item.id,
          typeId: selectedType,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Switch Type"
          buttonLabel="Save"
          onClose={onClose}
          onClick={handleSave}
          buttonProps={{ loading: isLoading }}
        />

        <Divider sx={{ my: 2 }} />

        <FormControl>
          <FormLabel>Type</FormLabel>
          <RadioGroup
            value={selectedType}
            onChange={(e: any) => setSelectedType(+e.target.value)}
          >
            {types &&
              types?.map((type: IItemType) => (
                <FormControlLabel
                  key={type.id}
                  value={type.id}
                  control={<Radio />}
                  label={type.name}
                />
              ))}
          </RadioGroup>
        </FormControl>
      </BoxModal>
    </Modal>
  );
}
