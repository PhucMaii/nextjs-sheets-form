import { IInventoryItem } from '@/app/utils/type';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';

interface IProps {
  product: IInventoryItem;
}

export default function Product({ product }: IProps) {
  return (
    <Box display="flex" flexDirection="column" gap={2} p={2}>
      <Image
        src={product?.preference?.image || ''}
        alt={product.name}
        width={100}
        height={100}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6">{product.name}</Typography>
      </Box>
    </Box>
  );
}
