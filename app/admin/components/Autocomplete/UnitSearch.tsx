import { USER_ROLE } from '@/app/utils/enum';
import { Autocomplete, TextField } from '@mui/material';
import React from 'react';
import { filter } from './InventoryItemSearch';

interface IProps {
  value: any;
  handleSelectPromptedItem: any;
  role?: USER_ROLE;
  displayItems: string[];
  disabled?: boolean;
}

// const getNestedValue = (obj: any, path: string) => {
//   console.log(obj, 'OBJ')
//   const value = path.split('.').reduce((acc, key) => {
//     console.log(acc, key);
//     return acc[key];
//   }, obj);

//   return value
// }

export default function UnitSearch({
  value,
  handleSelectPromptedItem,
  role,
  displayItems,
  // displayKey,
  disabled,
}: IProps) {
  return (
    <Autocomplete
      disabled={disabled}
      value={value}
      onChange={(event, newValue) => {
        handleSelectPromptedItem(newValue);
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option);
        if (role === USER_ROLE.ADMIN && inputValue !== '' && !isExisting) {
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
      options={displayItems}
      getOptionLabel={(option) => {
        // Check if the option has a custom title (for new item suggestion)
        if (option.title) {
          return option.title;
        }
        // Regular option
        return option || '';
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {option.title || option}
          </li>
        );
      }}
      sx={{ width: '100%' }}
      freeSolo
      renderInput={(params) => <TextField {...params} label="Item" />}
    />
  );
}
