import { IVendor } from '@/app/utils/type';
import { Autocomplete, TextField } from '@mui/material';
import React from 'react';


interface IProps {
    vendors: IVendor[];
    value: any;
    onChange: any;
    variant?: 'outlined' | 'filled' | 'standard';
}

export default function VendorSearch({vendors, variant, value, onChange}: IProps) {
  return (
    <Autocomplete
        multiple
        value={value}
        onChange={onChange}
        id="tags-standard"
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
      />
  )
}
