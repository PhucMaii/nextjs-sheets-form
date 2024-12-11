import { IFifo } from '@/app/utils/type';
import { Box, Typography } from '@mui/material';
import React from 'react';

interface IProps {
    fifo: IFifo;
}

export default function BatchQuantity({fifo}: IProps) {
  return (
    <Box display="flex" flexDirection="column" gap={1} alignItems="center" justifyContent="center">
        <Typography variant="subtitle1">{fifo.vendorItem?.vendor?.name}</Typography>
        <Typography variant="h5" fontWeight="bold">
            {fifo.quantity}
        </Typography>
        <Typography variant="body1">
            Created at: {fifo.createdAt}
        </Typography>
    </Box>
  )
}
