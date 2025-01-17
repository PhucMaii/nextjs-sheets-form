import {
  AlertColor,
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  InputLabel,
  Modal,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { filter } from '../../Autocomplete/InventoryItemSearch';
import FileUpload from '../../FileUpload';
import { generateImgUrl } from '@/app/lib/s3';
import axios from 'axios';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  typeId: number;
}

export default function AddItemIntoType({
  open,
  onClose,
  showNotification,
  typeId,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    name: '',
    image: '',
    price: 0,
    description: '',
    isBestSeller: false,
    typeId,
  });

  useEffect(() => {
    if (promptedItem.id > 0) {
      const itemPrice = promptedItem.vendorItem[0].unit.find(
        (unit: any) => unit.ratio === 1
      );
      
      setPromptedItem((prevState: any) => ({
        ...prevState,
        price: itemPrice.unitPrice * 2 
      }));
    }
  }, [promptedItem.id]);

  const onAddItemIntoType = async () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL.ADMIN}/productTypes/item-preference`,
        {
          ...promptedItem,
          inventoryItemId: promptedItem.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Internal Server Error: ' + error?.response?.data?.error,
      );
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Item Into Type"
          buttonLabel="ADD"
          onClick={onAddItemIntoType}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={2} flexDirection="column">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <InputLabel>Select Item</InputLabel>
            {/* <FormControlLabel
              label="Best Seller"
              control={
                <Switch
                  checked={promptedItem.isBestSeller}
                  onChange={(e: any) =>
                    setPromptedItem((prevState: any) => ({
                      ...prevState,
                      isBestSeller: e.target.checked,
                    }))
                  }
                />
              }
            /> */}
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
            value={promptedItem.price}
            onChange={(e) => {
              setPromptedItem((prevState: any) => ({
                ...prevState,
                price: +e.target.value,
              }));
            }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <InputLabel htmlFor="discount">Discount</InputLabel>
            <FormControlLabel 
              label="Show Discount"
              control={
                <Switch
                  checked={promptedItem.isShowDiscount}
                  onChange={(e: any) =>
                    setPromptedItem((prevState: any) => ({
                      ...prevState,
                      isShowDiscount: e.target.checked,
                    }))
                  }
                />
              }
              labelPlacement='end'
            />
          </Box>
          <TextField 
            id="discount"
            label="Previous price"
            placeholder="Enter previous price..."
            type="number"
            value={promptedItem.prevPrice}
            onChange={(e) => {
              setPromptedItem((prevState: any) => ({
                ...prevState,
                prevPrice: +e.target.value,
              }));
            }}
          />

          {/* <Typography>Description</Typography> */}
          {/* <TextField
            label="Description"
            placeholder="Enter item description..."
            multiline
            rows={2}
            value={promptedItem?.description}
            onChange={(e) => {
              setPromptedItem((prevState: any) => ({
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
              <Typography>{promptedItem.image}</Typography>
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
