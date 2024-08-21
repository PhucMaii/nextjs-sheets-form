import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { LoadingButton } from '@mui/lab';

interface IModalHead {
  heading: string;
  buttonLabel: string;
  onClick: any;
  buttonProps: any;
  onClose: any;
}

export default function ModalHead({
  heading,
  buttonLabel,
  onClick,
  buttonProps,
  onClose,
}: IModalHead) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h4">{heading}</Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton variant="contained" onClick={onClick} {...buttonProps}>
          {buttonLabel}
        </LoadingButton>
      </Box>
    </Box>
  );
}
