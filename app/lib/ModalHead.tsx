import { Box, Button, IconButton, Typography } from '@mui/material';
import React from 'react';
import { LoadingButton } from '@mui/lab';
import Close from '@mui/icons-material/Close';

interface IModalHead {
  heading: string;
  buttonLabel: string;
  onClick: any;
  buttonProps: any;
  onClose: any;
  onlyHeading?: boolean;
  closeButtonProps?: any;
  containerStyle?: any;
}

export default function ModalHead({
  heading,
  buttonLabel,
  onClick,
  buttonProps,
  onClose,
  onlyHeading,
  closeButtonProps,
  containerStyle,
}: IModalHead) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" style={containerStyle}>
      <Typography variant="h4" fontWeight={500}>
        {heading}
      </Typography>

      {onlyHeading ? (
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      ) : (
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="outlined"
            onClick={onClose}
            {...(closeButtonProps || {})}
          >
            Cancel
          </Button>
          <LoadingButton variant="contained" onClick={onClick} {...buttonProps}>
            {buttonLabel}
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
}
