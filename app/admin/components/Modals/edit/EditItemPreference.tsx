import {
  AlertColor,
  Autocomplete,
  Box,
  Button,
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
import React, { memo, useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IInventoryItem, IItemPreference } from '@/app/utils/type';
import { filter } from './EditStockPurchased';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import FileUpload from '../../FileUpload';
import axios from 'axios';
import useEditUnit from '@/hooks/unit/useEditUnit';
import useImageGallery from '@/hooks/useImageGallery';
// import useEditUnit from '@/hooks/unit/useEditUnit';

interface IProps {
  itemPreference?: IItemPreference;
  showNotification: (type: AlertColor, message: string) => void;
}

const EditItemPreference = ({ itemPreference, showNotification }: IProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [promptedItem, setPromptedItem] = useState<IInventoryItem | any>({
    id: -1,
    name: '-- Choose an item --',
  });

  const [updatedItem, setUpdatedItem] = useState<any>({
    ...(itemPreference || {}),
    units: [],
    inventoryUnit: null,
  });

  const { selectedImage, renderImageGallery } = useImageGallery(
    itemPreference?.image,
    '100%',
  );

  const { selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
    useEditUnit(
      updatedItem?.units || [],
      updatedItem?.inventoryUnit || null,
      showNotification,
      false,
    );

  const [inventoryItems] = SWRFetchData(
    open ? `${API_URL.ADMIN}/inventory` : '',
  );
  const [types] = SWRFetchData(open ? `${API_URL.ADMIN}/productTypes` : '');

  useEffect(() => {
    if (itemPreference && inventoryItems) {
      const targetItemPreference = inventoryItems.data.find(
        (item: IInventoryItem) => item.id === itemPreference.inventoryItemId,
      );

      if (targetItemPreference) {
        let units =
          targetItemPreference?.vendorItem?.flatMap((item: any) => item.unit) ||
          [];

        units = Array.from(
          new Map(units?.map((unit: any) => [unit.ratio, unit])).values(),
        );
        setPromptedItem({
          ...targetItemPreference,
          image: itemPreference.image,
        });
        setUpdatedItem(() => ({
          ...itemPreference,
          units,
        }));
      }
    }
  }, [itemPreference, inventoryItems]);

  useEffect(() => {
    if (selectedUnit) {
      setUpdatedItem((prevState: any) => ({
        ...prevState,
        price:
          selectedUnit.id !== itemPreference?.inventoryUnitId
            ? selectedUnit.unitPrice * 2
            : itemPreference.price,
        inventoryUnit: selectedUnit,
        inventoryUnitId: selectedUnit?.id,
      }));
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (promptedItem.id !== -1) {
      let units =
        promptedItem?.vendorItem?.flatMap((item: any) => item.unit) || [];

      units = Array.from(
        new Map(units?.map((unit: any) => [unit.ratio, unit])).values(),
      );

      setUpdatedItem((prevState: any) => ({
        ...prevState,
        units: units,
      }));
    }
  }, [promptedItem.id]);

  const onUpdateItemPreference = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/productTypes/item-preference`,
        {
          ...updatedItem,
          image:
            selectedImage !== itemPreference?.image
              ? selectedImage
              : promptedItem.image !== itemPreference?.image
                ? promptedItem.image
                : itemPreference?.image,
          units: updatedItem.units,
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
    <>
      {AddUnitModal}
      {EditUnitModal}
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          {/* {AddUnitModal}
      {EditUnitModal} */}
          <ModalHead
            heading="Edit Item Preference"
            buttonLabel="Save"
            onClose={() => setOpen(false)}
            buttonProps={{ loading: isUpdating }}
            onClick={onUpdateItemPreference}
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
              options={[
                { id: -1, name: '-- Choose an item --' },
                ...(inventoryItems?.data || []),
              ]}
              getOptionLabel={(option) => {
                // Regular option
                return option?.name || '';
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;

                // const isDisabled = disabledItems?.includes(option?.id);
                return (
                  <li
                    key={key}
                    {...optionProps}
                    aria-disabled={option.id === -1}
                  >
                    {option.name}
                  </li>
                );
              }}
              sx={{ width: '100%' }}
              renderInput={(params) => <TextField {...params} label="Item" />}
            />

            <InputLabel htmlFor="name">Name</InputLabel>
            <TextField
              id="name"
              label="Name"
              placeholder="Enter item name..."
              value={updatedItem?.name || ''}
              onChange={(e: any) => {
                setUpdatedItem((prevState: any) => ({
                  ...prevState,
                  name: e.target.value,
                }));
              }}
            />

            {UnitDisplay}

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
            <Typography>Select Image</Typography>
            {renderImageGallery()}
            <Divider>Or</Divider>

            <Typography>Upload Image</Typography>
            {/* {promptedItem?.image && (
              <Box display="flex" gap={2} alignItems="center">
                <img
                  src={
                    promptedItem?.image
                      ? generateImgUrl(promptedItem?.image)
                      : ''
                  }
                  alt={promptedItem.name}
                  width={100}
                  height={100}
                />
                <Typography>{promptedItem?.image}</Typography>
              </Box>
            )} */}
            <FileUpload
              item={promptedItem}
              showNotification={showNotification}
              setPromptedItem={setPromptedItem}
            />
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(EditItemPreference, (prev, next) => {
  return Object.is(prev.itemPreference, next.itemPreference);
});
