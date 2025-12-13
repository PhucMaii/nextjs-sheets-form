import { renderType } from '@/app/lib/render';
import { USER_CATEGORIZED } from '@/app/utils/enum';
import { UserType } from '@/app/utils/type';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import React from 'react';

interface IProps {
  clients: UserType[];
  value: UserType | null;
  onChange: (event: React.SyntheticEvent, value: UserType | null) => void;
}

export default function ClientSearch({ clients, value, onChange }: IProps) {
  const getOptionLabel = (option: any) => {
    if (option.clientName === 'All Clients') {
      return option.clientName;
    }
    return `${option.clientName} - ${option.clientId}`;
  };

  const renderOption = (props: any, option: UserType) => {
    return (
      <li {...props}>
        <Box display="flex" gap={2} alignItems="center">
          <Typography>
            {option.clientName} - {option.clientId}
          </Typography>
          {option?.type &&
            option.type !== USER_CATEGORIZED.NONE &&
            renderType(option.type)}
        </Box>
      </li>
    );
  };

  return (
    <Autocomplete
      options={clients}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => <TextField {...params} label="Client" />}
      renderOption={renderOption}
      value={value}
      onChange={onChange}
      sx={{ width: 'auto' }}
    />
  );
}
