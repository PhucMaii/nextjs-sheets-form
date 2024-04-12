import { FormControl, FormLabel, TextField } from '@mui/material';
import React from 'react'

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  label: string;
  name: string;
}

function TextInput(props: TextInputProps) {
    console.log("text Input got re render")
  return (
    <FormControl sx={{ display: 'flex' }}>
      <FormLabel id={props.name} sx={{ textAlign: 'start', mt: 1 }}>
        {props.label}
      </FormLabel>
      <TextField
        aria-labelledby={props.name}
        name={props.name}
        size='small'
        type="text"
        fullWidth
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </FormControl>
  )
}

// Before memo
// export default TextInput;

// After memo
export default React.memo(TextInput, (prev, next) => {
  return prev.name === next.name
    && prev.label === next.label;
})