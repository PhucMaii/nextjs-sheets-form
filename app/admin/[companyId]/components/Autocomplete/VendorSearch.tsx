import { IVendor } from '@/app/utils/type';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import React from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface IProps {
  vendors: IVendor[];
  value: any;
  onChange: any;
  variant?: 'outlined' | 'filled' | 'standard';
  multiple?: boolean;
}

export const checkBoxOutlinedIcon = (
  <CheckBoxOutlineBlankIcon fontSize="small" />
);
export const checkedBoxOutlinedIcon = <CheckBoxIcon fontSize="small" />;

export default function VendorSearch({
  vendors,
  variant,
  value,
  onChange,
  multiple = false,
}: IProps) {
  return (
    <Autocomplete
      multiple={multiple}
      value={value}
      onChange={onChange}
      id="tags-standard"
      disableCloseOnSelect={multiple}
      options={vendors}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          variant={variant ? variant : 'outlined'}
          label="Vendors"
          placeholder="Select Vendors"
        />
      )}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      renderOption={(props, option, { selected }) => {
        const { key, ...optionProps } = props;
        return (
          <li key={key} {...optionProps}>
            {multiple && (
              <Checkbox
                icon={checkBoxOutlinedIcon}
                checkedIcon={checkedBoxOutlinedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
            )}
            {option.name}
          </li>
        );
      }}
    />
  );
}
