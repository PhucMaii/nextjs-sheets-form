import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface IProps {
  transactionTypes: any[];
  value: any;
  onChange: (event: React.SyntheticEvent, value: any) => void;
}

export default function TransactionTypeSearch({
  transactionTypes,
  value,
  onChange,
}: IProps) {
  return (
    <Autocomplete
      options={transactionTypes}
      getOptionLabel={(option: any) => option.name}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      renderInput={(params) => (
        <TextField {...params} label="Select Transaction Type" />
      )}
      value={value}
      onChange={onChange}
    />
  );
}
