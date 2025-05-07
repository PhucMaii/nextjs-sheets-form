import { InputAdornment, TextField, TextFieldVariants } from '@mui/material';
import { SearchIcon } from 'lucide-react';
import React from 'react';

interface TextInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  label: string;
  name: string;
  placeholder?: string;
  variant?: TextFieldVariants;
  type?: string;
}

function SearchInput(props: TextInputProps) {
  return (
    <TextField
      // label={props.label}
      // aria-labelledby={props.name}
      name={props.name}
      placeholder={props.placeholder}
      variant={props.variant || 'outlined'}
      type={props.type || 'text'}
      fullWidth
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}

// Avoid many re renders
export default React.memo(SearchInput, (prev, next) => {
  return (
    prev.name === next.name &&
    prev.label === next.label &&
    prev.value === next.value
  );
});
