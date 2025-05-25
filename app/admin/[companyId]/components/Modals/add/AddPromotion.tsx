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
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl, PROMOTION_STATUS } from '@/app/utils/enum';
import { IInventoryItem } from '@/app/utils/type';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import StatusText from '../../StatusText';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  isWebsite?: boolean;
  customOnClick?: (data: any) => void;
}

export default function AddPromotion({
  open,
  onClose,
  showNotification,
  isWebsite = false,
  customOnClick,
}: IProps) {
  const { companyId }: any = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState<PROMOTION_STATUS | string>(
    PROMOTION_STATUS.INACTIVE,
  );
  const [selectedItems, setSelectedItems] = useState<IInventoryItem[]>([]);

  const [inventoryItems] = SWRFetchData(
    `${isWebsite ? getAdminApiUrl(companyId, '/website/items') : getAdminApiUrl(companyId, '/inventory')}`,
  );

  const handleAddPromotion = async () => {
    setIsLoading(true);
    try {
      let response: any;

      if (customOnClick) {
        response = await customOnClick({
          title,
          status,
          itemIds: selectedItems.map((item) => item.id),
        });
      } else {
        response = await axios.post(
          getAdminApiUrl(companyId, '/promotions'),
          {
            title,
            status,
            itemIds: selectedItems.map((item) => item.id),
          },
        );
      }

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
      <BoxModal maxHeight={'80vh'} overflow={'scroll'}>
        <ModalHead
          heading="Add Promotion"
          buttonLabel="ADD"
          onClick={handleAddPromotion}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
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
            <Typography>Promoted items</Typography>
            <Autocomplete
              multiple
              id="tags-standard"
              options={inventoryItems?.data || []}
              getOptionLabel={(option: any) =>
                option?.sku ? `${option?.sku} | ${option?.name}` : option?.name
              }
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
                    {option?.sku
                      ? `${option?.sku} | ${option?.name}`
                      : option?.name}
                  </li>
                );
              }}
            />
          </FormControl>
        </Box>
      </BoxModal>
    </Modal>
  );
}
