import {
  AlertColor,
  Autocomplete,
  Box,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { filter } from '../../Autocomplete/InventoryItemSearch';
import FileUpload from '../../FileUpload';
import { generateImgUrl } from '@/app/lib/s3';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddItemIntoType({ open, onClose, showNotification }: IProps) {
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);
  const [promptedItem, setPromptedItem] = useState<any>({
    id: -1,
    name: '',
  });

//   console.log(inventoryItems, 'inventoryItems');

//   console.log(promptedItem.name, 'promptedItem');

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Item Into Type"
          buttonLabel="ADD"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" gap={2} flexDirection="column">
            <Typography>Select Item</Typography>
            <Autocomplete
            value={promptedItem}
            onChange={(event, newValue) => {
                setPromptedItem(newValue);
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

            <Typography>Description</Typography>
            <TextField
                label="Description"
                placeholder="Enter item description..."
                multiline
                rows={2}
                value={promptedItem?.description}
                onChange={(e) => {
                    setPromptedItem({
                    ...promptedItem,
                    description: e.target.value,
                    });
                }}
            />

            <Typography>Upload Image</Typography>
            {promptedItem?.image && <img src={promptedItem?.image ? generateImgUrl(promptedItem?.image) : ''} alt={promptedItem.name} width={100} height={100} />}
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
