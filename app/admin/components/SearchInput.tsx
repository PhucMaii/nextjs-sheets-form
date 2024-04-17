import { TextField, TextFieldVariants } from '@mui/material';
import React from 'react';

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label: string;
  name: string;
  placeholder?: string;
  variant?: TextFieldVariants;
}

function SearchInput(props: TextInputProps) {
  return (
    <TextField
      label={props.label}
      aria-labelledby={props.name}
      name={props.name}
      placeholder={props.placeholder}
      variant={props.variant || 'outlined'}
      type="text"
      fullWidth
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
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
