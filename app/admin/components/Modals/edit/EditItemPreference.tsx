import {
  AlertColor,
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryItem, IItemPreference } from '@/app/utils/type';
import { filter } from './EditStockPurchased';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { generateImgUrl } from '@/app/lib/s3';
import FileUpload from '../../FileUpload';
import { ModalProps } from '../type';
import axios from 'axios';

interface IProps extends ModalProps {
  itemPreference?: IItemPreference;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditItemPreference({
  open,
  onClose,
  itemPreference,
  showNotification,
}: IProps) {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [promptedItem, setPromptedItem] = useState<IInventoryItem | any>(
    itemPreference?.inventoryItem || { id: -1, name: '-- Choose an item --' },
  );
  const [updatedItem, setUpdatedItem] = useState<IItemPreference | null>(
    itemPreference || null,
  );

  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [types] = SWRFetchData(`${API_URL.ADMIN}/productTypes`);

  useEffect(() => {
    if (itemPreference) {
      setPromptedItem({
        ...itemPreference.inventoryItem,
        image: itemPreference.image,
      });
      setUpdatedItem(itemPreference);
    }
  }, [itemPreference]);

  useEffect(() => {
    if (promptedItem.id !== updatedItem?.inventoryItemId) {
      const itemPrice = promptedItem.vendorItem[0].unit.find(
        (unit: any) => unit.ratio === 1,
      );

      setUpdatedItem((prevState: any) => ({
        ...prevState,
        price: itemPrice.unitPrice * 2,
      }));
    } else {
      setUpdatedItem((prevState: any) => ({
        ...prevState,
        price: itemPreference?.price,
      }));
    }
  }, [promptedItem.id]);

  const handleUpdateItemPreference = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/productTypes/item-preference`,
        {
          ...updatedItem,
          image: promptedItem.image,
          inventoryItemId: promptedItem.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error?.response?.data?.error,
      );
      setIsUpdating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Edit Item Preference"
          buttonLabel="Save"
          onClose={onClose}
          buttonProps={{ loading: isUpdating }}
          onClick={handleUpdateItemPreference}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} flexDirection="column">
          <Typography>Move To</Typography>
          <Select
            value={updatedItem?.typeId}
            onChange={(e: any) =>
              setUpdatedItem((prevState: any) => ({
                ...prevState,
                typeId: e.target.value,
              }))
            }
          >
            {types?.data?.map((type: any) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>

          <Divider sx={{ my: 2 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>Select Item</Typography>
            <FormControlLabel
              label="Best Seller"
              control={
                <Switch
                  checked={updatedItem?.isBestSeller}
                  onChange={(e: any) =>
                    setUpdatedItem((prevState: any) => ({
                      ...prevState,
                      isBestSeller: e.target.checked,
                    }))
                  }
                />
              }
            />
          </Box>
          <Autocomplete
            value={promptedItem}
            onChange={(event, newValue) => {
              setPromptedItem((prevState: any) => ({
                ...prevState,
                ...newValue,
              }));
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);
              return filtered;
            }}
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            id="free-solo-with-text-demo"
            options={
              [
                { id: -1, name: '-- Choose an item --' },
                ...(inventoryItems?.data || []),
              ] || []
            }
            getOptionLabel={(option) => {
              // Regular option
              return option?.name || '';
            }}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;

              // const isDisabled = disabledItems?.includes(option?.id);
              return (
                <li key={key} {...optionProps} aria-disabled={option.id === -1}>
                  {option.name}
                </li>
              );
            }}
            sx={{ width: '100%' }}
            renderInput={(params) => <TextField {...params} label="Item" />}
          />

          <InputLabel htmlFor="price">Price</InputLabel>
          <TextField
            id="price"
            label="Price"
            placeholder="Enter item price..."
            type="number"
            value={updatedItem?.price || 0}
            onChange={(e) => {
              setUpdatedItem((prevState: any) => ({
                ...prevState,
                price: +e.target.value,
              }));
            }}
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <InputLabel htmlFor="discount">Discount</InputLabel>
            <FormControlLabel
              label="Show Discount"
              control={
                <Switch
                  checked={updatedItem?.isShowDiscount || false}
                  onChange={(e: any) =>
                    setUpdatedItem((prevState: any) => ({
                      ...prevState,
                      isShowDiscount: e.target.checked,
                    }))
                  }
                />
              }
              labelPlacement="end"
            />
          </Box>
          <TextField
            id="discount"
            label="Previous price"
            placeholder="Enter previous price..."
            type="number"
            value={updatedItem?.prevPrice || 0}
            onChange={(e) => {
              setUpdatedItem((prevState: any) => ({
                ...prevState,
                prevPrice: +e.target.value,
              }));
            }}
          />

          {/* <Typography>Description</Typography>
          <TextField
            label="Description"
            placeholder="Enter item description..."
            multiline
            rows={2}
            value={updatedItem?.description}
            onChange={(e) => {
              setUpdatedItem((prevState: any) => ({
                ...prevState,
                description: e.target.value,
              }));
            }}
          /> */}

          <Typography>Upload Image</Typography>
          {promptedItem?.image && (
            <Box display="flex" gap={2} alignItems="center">
              <img
                src={
                  promptedItem?.image ? generateImgUrl(promptedItem?.image) : ''
                }
                alt={promptedItem.name}
                width={100}
                height={100}
              />
              <Typography>{promptedItem?.image}</Typography>
            </Box>
          )}
          <FileUpload
            item={promptedItem}
            showNotification={showNotification}
            setPromptedItem={setPromptedItem}
          />
        </Box>
      </BoxModal>
    </Modal>
  );
}
