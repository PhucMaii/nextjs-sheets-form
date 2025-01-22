'use client';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import NavbarWrapper from '@/app/lib/NavbarWrapper';
import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { IItemPreference } from '@/app/utils/type';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
} from '@/constant/landingPage';
import useNotification from '@/hooks/useNotification';
import { Box, Button, Grid, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useParams } from 'next/navigation';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import React, { useEffect, useState } from 'react';
import { orange } from '@mui/material/colors';
import SavingsIcon from '@mui/icons-material/Savings';
import ProductListing from '@/app/components/ProductListingPage/ProductListing';

export default function ItemPage() {
  const { itemId }: any = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemData, setItemData] = useState<IItemPreference | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchItemData();
  }, []);

  const fetchItemData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL.PUBLIC}/products/${itemId}`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      setItemData(response.data.data);
      setIsLoading(false);
    } catch (err: any) {
      showNotification(
        'error',
        `Internal Server Error: ${err?.response?.data?.error || 'An error occurred'}`,
      );
      console.log('Internal Server Error: ', err);
      setIsLoading(false);
    }
  };

  const renderProductInfo = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography
          variant="h5"
          fontWeight="medium"
          sx={{ color: landingPagePrimaryColor }}
        >
          {itemData?.inventoryItem.name}
        </Typography>

        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ mt: 4, color: landingPagePrimaryColor }}
        >
          ${itemData?.price}
        </Typography>

        {/* Advertised user to get applied */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ backgroundColor: orange[50], p: 2, borderRadius: 2 }}
        >
          <SavingsIcon sx={{ color: landingPageSecondaryColor }} />
          <Typography
            variant="subtitle1"
            sx={{ color: landingPageSecondaryColor }}
          >
            Want a better prices? Unlock wholesale savings - <a>Apply now</a>
          </Typography>
        </Box>

        <Grid container alignItems="center" columnSpacing={2} rowGap={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1" sx={{ mr: 1 }}>
                Quantity:
              </Typography>
              <Select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: '200px',
                      overflow: 'auto',
                    },
                  },
                }}
              >
                {Array.from({ length: 30 }, (_, index) => index + 1).map(
                  (quantity) => (
                    <MenuItem value={quantity} key={quantity}>
                      {quantity}
                    </MenuItem>
                  ),
                )}
              </Select>
            </Box>
          </Grid>
          <Grid item xs={12} md={10}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                color: 'white',
                backgroundColor: landingPagePrimaryColor,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: landingPageSecondaryColor,
                },
              }}
              startIcon={<AddShoppingCartIcon />}
            >
              Add to Cart
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderRelatedItems = () => {
    return (
      <>
        <Typography 
            variant="h5" 
            fontWeight="bold"
            textAlign="center"
            sx={{ color: landingPagePrimaryColor }}
        >
          Don't miss these favorites
        </Typography>

        <Box display="flex" flexDirection="row" gap={4} sx={{overflowX: 'scroll', whiteSpace: 'nowrap'}}>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>

            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>
            <Box sx={{minWidth: 200}}>
            <ProductListing product={itemData as IItemPreference} onClick={() => {}} />
            </Box>


        </Box>
      </>
    );
  }

  if (isLoading) {
    return (
      <NavbarWrapper setIsOpenSignUp={() => {}}>
        <LoadingComponent />
      </NavbarWrapper>
    );
  }

  return (
    <NavbarWrapper setIsOpenSignUp={() => {}}>
      {NotificationComp}
      <Box display="flex" flexDirection="column" gap={4} sx={{ maxWidth: '1500px', mx: 'auto', p: 4 }}>
        <Grid container rowGap={2}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={itemData?.image && generateImgUrl(itemData?.image)}
              alt={itemData?.inventoryItem.name}
              style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {renderProductInfo()}
          </Grid>
        </Grid>
        {renderRelatedItems()}
      </Box>
    </NavbarWrapper>
  );
}
