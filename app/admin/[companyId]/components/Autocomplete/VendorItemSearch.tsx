import { USER_ROLE } from '@/app/utils/enum';
import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import React from 'react';

export const filter = createFilterOptions<any>();

interface IProps {
  promptedItem: any;
  handleSelectPromptedItem: any;
  role?: USER_ROLE;
  displayItems: any[];
  disabled?: boolean;
  disabledItems?: any[];
}

export default function VendorItemSearch({
  promptedItem,
  handleSelectPromptedItem,
  role,
  displayItems,
  disabled,
  disabledItems,
}: IProps) {
  return (
    <Autocomplete
      disabled={disabled}
      value={promptedItem.name}
      onChange={(event, newValue) => {
        handleSelectPromptedItem(newValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        // const { inputValue } = params;
        // // Suggest the creation of a new value
        // const isExisting = options.some(
        //   (option) => inputValue === option?.inventoryItem?.name,
        // );
        // if (role === USER_ROLE.ADMIN && inputValue !== '' && !isExisting) {
        //   filtered.push({
        //     inputValue,
        //     title: `Add "${inputValue}"`,
        //   });
        // }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={[
        { id: -1, name: '-- Choose an item --' },
        ...(displayItems || []),
      ]}
      getOptionLabel={(option) => {
        // Check if the option has a custom title (for new item suggestion)
        if (option.title) {
          return option.title;
        }

        if (option?.inventoryItem?.sku) {
          return `${option?.inventoryItem?.sku} | ${option?.inventoryItem?.name}`;
        }
        // Regular option
        return option?.inventoryItem?.name || '';
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;

        const isDisabled = disabledItems?.includes(option?.id);
        return (
          <li key={key} {...optionProps} aria-disabled={isDisabled}>
            {option.title
              ? option.title
              : option?.inventoryItem?.sku
                ? `${option?.inventoryItem?.sku} | ${option?.inventoryItem?.name}`
                : option?.inventoryItem?.name}
          </li>
        );
      }}
      sx={{ width: '100%' }}
      freeSolo={role === USER_ROLE.ADMIN}
      renderInput={(params) => <TextField {...params} label="Item" />}
    />
  );
}
