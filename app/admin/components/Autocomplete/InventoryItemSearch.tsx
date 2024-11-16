import { USER_ROLE } from '@/app/utils/enum';
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import React from 'react'

const filter = createFilterOptions<any>();

interface IProps {
    promptedItem: any;
    handleSelectPromptedItem: any;
    role?: USER_ROLE;
    displayItems: any[];
}

export default function InventoryItemSearch({promptedItem, handleSelectPromptedItem, role, displayItems}: IProps) {
  return (
    <Autocomplete
    value={promptedItem.name}
    onChange={(event, newValue) => {
        handleSelectPromptedItem(newValue);
    }}
    filterOptions={(options, params) => {
      const filtered = filter(options, params);

      const { inputValue } = params;
      // Suggest the creation of a new value
      const isExisting = options.some(
        (option) => inputValue === option.name,
      );
      if (
        role === USER_ROLE.ADMIN &&
        inputValue !== '' &&
        !isExisting
      ) {
        filtered.push({
          inputValue,
          title: `Add "${inputValue}"`,
        });
      }

      return filtered;
    }}
    selectOnFocus
    clearOnBlur
    handleHomeEndKeys
    id="free-solo-with-text-demo"
    options={
      [
        { id: -1, name: '-- Choose an item --' },
        ...(displayItems || []),
      ] || []
    }
    getOptionLabel={(option) => {
      // Check if the option has a custom title (for new item suggestion)
      if (option.title) {
        return option.title;
      }
      // Regular option
      return option.name || '';
    }}
    renderOption={(props, option) => {
      const { key, ...optionProps } = props;
      return (
        <li key={key} {...optionProps}>
          {option.title || option.name}
        </li>
      );
    }}
    sx={{ width: '100%' }}
    freeSolo
    renderInput={(params) => <TextField {...params} label="Item" />}
  />
  )
}
