import { generateImgUrl } from '@/app/lib/s3';
import { IItemPreference } from '@/app/utils/type';
import { Box, Typography } from '@mui/material'
import { grey, orange } from '@mui/material/colors';
import React from 'react';

interface IProps {
    product: IItemPreference;
}

export default function ProductListing({product}: IProps) {
  return (
    <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap={1}
        sx={{ width: 300, px: 6 }}
        position="relative"
    >
        <img
          src={
            product?.image ? generateImgUrl(product?.image) : '/images/landing/image_not_found.jpeg'
          }
          alt={product.inventoryItem.name}
          width='100%'
          height={200}
          style={{ borderRadius: '20px' }}
        />
        {product?.isBestSeller && <Box position="absolute" sx={{backgroundColor: orange[800], color: 'white', p: 1, borderRadius: 2, top: -10, right: 45}}>
            <Typography>Best Seller 🔥</Typography>
        </Box>}
        <Typography variant="h6" fontWeight="bold">
          {product.inventoryItem.name}
        </Typography>
        <Typography variant="body1" sx={{color: grey[600]}} fontWeight="normal">
          {product.description} 
        </Typography>
    </Box>  
  )
}
