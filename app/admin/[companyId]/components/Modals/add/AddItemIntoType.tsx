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
import { getAdminApiUrl } from '@/app/utils/enum';
import FileUpload from '../../FileUpload';
import { generateImgUrl } from '@/app/lib/s3';
import axios from 'axios';
import { filter } from '../../Autocomplete/VendorItemSearch';
import useEditUnit from '@/hooks/unit/useEditUnit';
import useImageGallery from '@/hooks/useImageGallery';
import { useParams } from 'next/navigation';
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
  const { companyId }: any = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    name: '',
    customName: '',
    image: '',
    price: 0,
    description: '',
    isBestSeller: false,
    units: [],
    inventoryUnit: null,
    typeId,
  });

  const [inventoryItems] = SWRFetchData(getAdminApiUrl(companyId, '/inventory'));


  const { selectedImage, renderImageGallery } = useImageGallery(
    'products',
    '',
    '100%',
  );

  const { selectedUnit, AddUnitModal, EditUnitModal, UnitDisplay } =
    useEditUnit(
      promptedItem.units,
      promptedItem.inventoryUnit,
      showNotification,
      false,
    );

  useEffect(() => {
    if (promptedItem.id > 0) {
      const itemPrice = promptedItem.vendorItem[0].unit.find(
        (unit: any) => unit.ratio === 1,
      );

      let units =
        promptedItem?.vendorItem?.flatMap((item: any) => item.unit) || [];

      units = Array.from(
        new Map(units?.map((unit: any) => [unit.ratio, unit])).values(),
      );

      setPromptedItem((prevState: any) => ({
        ...prevState,
        price: itemPrice.unitPrice * 2,
        units,
      }));
    }
  }, [promptedItem.id]);

  useEffect(() => {
    if (selectedUnit) {
      setPromptedItem((prevState: any) => ({
        ...prevState,
        inventoryUnit: selectedUnit,
        inventoryUnitId: selectedUnit?.id,
      }));
    }
  }, [selectedUnit]);

  const onAddItemIntoType = async () => {
    if (promptedItem.id === -1) {
      showNotification('error', 'Please select item');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/productTypes/item-preference'),
        {
          ...promptedItem,
          name: promptedItem.customName,
          inventoryItemId: promptedItem.id,
          image: selectedImage || promptedItem.image,
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
      <BoxModal
        maxHeight="80vh"
        sx={{ overflowY: 'scroll', overflowX: 'hidden' }}
        maxWidth="900px"
      >
        {AddUnitModal}
        {EditUnitModal}
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
                <li key={key} {...optionProps} aria-disabled={option.id === -1}>
                  {option.name}
                </li>
              );
            }}
            sx={{ width: '100%' }}
            renderInput={(params) => <TextField {...params} label="Item" />}
          />

          <InputLabel>Name</InputLabel>
          <TextField
            id="name"
            label="Name"
            placeholder="Enter item name..."
            value={promptedItem.customName}
            onChange={(e) => {
              setPromptedItem((prevState: any) => ({
                ...prevState,
                customName: e.target.value,
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
            value={promptedItem.price}
            onChange={(e) => {
              setPromptedItem((prevState: any) => ({
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
                  checked={promptedItem.isShowDiscount}
                  onChange={(e: any) =>
                    setPromptedItem((prevState: any) => ({
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
          <Typography>Select Image</Typography>
          {renderImageGallery()}
          <Divider>Or</Divider>

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
            showNotification={showNotification}
            onUploadImageUI={(fileKey: string) =>
              setPromptedItem({
                ...promptedItem,
                image: fileKey,
              })
            }
            fileName={promptedItem.name + Date.now()}
            uploadLocation={`products/${promptedItem.name}`}
          />
        </Box>
      </BoxModal>
    </Modal>
  );
}
