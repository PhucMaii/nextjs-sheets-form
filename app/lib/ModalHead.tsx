import { Box, Typography } from '@mui/material';
import React from 'react';
import { LoadingButton } from '@mui/lab';

interface IModalHead {
  heading: string;
  buttonLabel: string;
  onClick: any;
  buttonProps: any;
}

export default function ModalHead({
  heading,
  buttonLabel,
  onClick,
  buttonProps,
}: IModalHead) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h4">{heading}</Typography>
      <LoadingButton variant="contained" onClick={onClick} {...buttonProps}>
        {buttonLabel}
      </LoadingButton>
    </Box>
  );
}
