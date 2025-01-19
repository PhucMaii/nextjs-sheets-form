import { generateImgUrl } from '@/app/lib/s3';
import { IItemPreference } from '@/app/utils/type';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import { Box, Button, Typography } from '@mui/material';
import { green, red } from '@mui/material/colors';
import React from 'react';

interface IProps {
  product: IItemPreference;
}

export default function ProductListing({ product }: IProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      // alignItems="center"
      flexGrow={1}
      gap={1}
      sx={{ height: '100%' }}
      position="relative"
    >
      <img
        src={
          product?.image
            ? generateImgUrl(product?.image)
            : '/images/landing/image_not_found.jpeg'
        }
        alt={product.inventoryItem.name}
        width="100%"
        height={200}
        style={{ borderRadius: '20px' }}
      />
      {/* {product?.isBestSeller && (
        <Box
          position="absolute"
          sx={{
            backgroundColor: orange[800],
            color: 'white',
            p: 1,
            borderRadius: 2,
            top: -10,
            right: 45,
          }}
        >
          <Typography>Best Seller 🔥</Typography>
        </Box>
      )} */}
      <Typography variant="h6" fontWeight="regular" sx={{ color: green[800] }}>
        {product.inventoryItem.name}
      </Typography>
      {/* <TextField 
            type="number"
            variant="outlined"
            size="small"
            sx={{ 
              maxWidth: '12ch' 
            }}
            /> */}
      <div style={{ flexGrow: 1 }} />
      <Box display="flex" alignItems="flex-end" gap={1}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color:
              product?.isShowDiscount && product?.prevPrice
                ? red[600]
                : green[900],
          }}
        >
          ${product?.price?.toFixed(2) || 'N/A'}
        </Typography>
        {product?.isShowDiscount && product?.prevPrice && (
          <Typography
            variant="body1"
            sx={{ color: green[900], textDecoration: 'line-through' }}
          >
            ${product.prevPrice.toFixed(2)}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: landingPagePrimaryColor,
          alignSelf: 'flex-end',
          color: 'white',
          borderRadius: 2,
          ':hover': {
            backgroundColor: landingPageSecondaryColor,
          },
        }}
      >
        Add to cart
      </Button>
      {/* <Typography variant="body1" sx={{color: grey[600]}} fontWeight="normal">
          {product.description} 
        </Typography> */}
    </Box>
  );
}
