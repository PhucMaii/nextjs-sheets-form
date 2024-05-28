import { Box, Typography } from '@mui/material';
import React from 'react';
import LoadingButtonStyles from '../components/LoadingButtonStyles';
import { infoColor } from '../theme/color';

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
      <LoadingButtonStyles
        variant="contained"
        // disabled={itemList.length === 0}
        // loading={isButtonLoading
        onClick={onClick}
        color={infoColor}
        {...buttonProps}
      >
        {buttonLabel}
      </LoadingButtonStyles>
    </Box>
  );
}
