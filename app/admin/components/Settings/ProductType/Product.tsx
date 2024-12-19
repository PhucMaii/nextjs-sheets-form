import { IInventoryItem } from '@/app/utils/type';
import { Box } from '@mui/material';
import React from 'react';

interface IProps {
    product: IInventoryItem;
}

export default function Product({product}: IProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2} p={2}>
        
    </Box>
  )
}
