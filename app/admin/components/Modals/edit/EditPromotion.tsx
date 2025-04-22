import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControl,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { IInventoryItem, IPromotion } from '@/app/utils/type';
import { API_URL, PROMOTION_STATUS } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import StatusText from '../../StatusText';

interface IProps extends ModalProps {
  promotion: IPromotion;
  showNotification: ShowNotificationType;
}

export default function EditPromotion({
  open,
  onClose,
  promotion,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [title, setTitle] = useState<string>(promotion?.title);
  const [status, setStatus] = useState<PROMOTION_STATUS | string>(
    promotion?.status,
  );
  const [selectedItems, setSelectedItems] = useState<IInventoryItem[]>([]);

  useEffect(() => {
    if (promotion) {
      setTitle(promotion.title);
      setSelectedItems(promotion.items);
      setStatus(promotion.status);
    }
  }, [promotion]);

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/promotions`, {
        id: promotion.id,
        title,
        status: promotion.status,
        itemIds: selectedItems.map((item) => item.id),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error?.response?.data?.error || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Edit Promotion"
          buttonLabel="Save"
          onClose={onClose}
          buttonProps={{ loading: isLoading }}
          onClick={handleSave}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <FormControl fullWidth>
            <Typography>Title</Typography>
            <OutlinedInput
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              placeholder="Enter promotion title..."
              size="small"
            />
          </FormControl>

          <FormControl fullWidth>
            <Typography>Status</Typography>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value={PROMOTION_STATUS.ACTIVE}>
                <StatusText text={PROMOTION_STATUS.ACTIVE} type="success" />
              </MenuItem>
              <MenuItem value={PROMOTION_STATUS.INACTIVE}>
                <StatusText text={PROMOTION_STATUS.INACTIVE} type="error" />
              </MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }}>Items</Divider>

          <FormControl fullWidth>
            <Typography>Promoted Product</Typography>
            <Autocomplete
              multiple
              id="tags-standard"
              options={inventoryItems?.data || []}
              getOptionLabel={(option: any) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // label="Promoted Product"
                  placeholder="Select Promoted Product"
                />
              )}
              disableCloseOnSelect
              value={selectedItems}
              onChange={(event, newValue) => {
                setSelectedItems(newValue);
              }}
              renderOption={(props, option, { selected }) => {
                return (
                  <li {...props}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option.name}
                  </li>
                );
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </FormControl>
        </Box>
      </BoxModal>
    </Modal>
  );
}
