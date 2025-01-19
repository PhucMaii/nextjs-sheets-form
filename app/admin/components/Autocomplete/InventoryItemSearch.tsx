import { Autocomplete, TextField } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import { filter } from './VendorItemSearch';
import { IInventoryItem } from '@/app/utils/type';

interface IProps {
  promptedItem: any;
  setPromptedItem: Dispatch<SetStateAction<any>>;
  displayItems: IInventoryItem[];
}

export default function InventoryItemSearch({
  promptedItem,
  setPromptedItem,
  displayItems,
}: IProps) {
  return (
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
        [{ id: -1, name: '-- Choose an item --' }, ...(displayItems || [])] ||
        []
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
  );
}
