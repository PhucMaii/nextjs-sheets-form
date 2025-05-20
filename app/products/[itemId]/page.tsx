'use client';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import NavbarWrapper from '@/app/lib/NavbarWrapper';
import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { IItem } from '@/app/utils/type';
import {
  landingPagePrimaryColor,
  landingPageSecondaryColor,
  maxWidth,
} from '@/constant/landingPage';
import useNotification from '@/hooks/useNotification';
import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useParams } from 'next/navigation';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import React, { useEffect, useState } from 'react';
import { grey, orange } from '@mui/material/colors';
import SavingsIcon from '@mui/icons-material/Savings';
import ProductListing from '@/app/components/ProductListingPage/ProductListing';
import { LoadingButton } from '@mui/lab';
import { addItemToCartAsync } from '@/state/cart/cartSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { ItemButton } from '@/app/components/OrderView';
import { primaryColor } from '@/theme/color';

export default function ItemPage() {
  const { itemId }: any = useParams();

  const [imgUrl, setImgUrl] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itemData, setItemData] = useState<IItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<IItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const cart = useSelector((state: RootState) => state.cart);

  const { showNotification, NotificationComp } = useNotification();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    fetchItemData();
  }, []);

  useEffect(() => {
    const fetchImgUrl = async () => {
      const data = await generateImgUrl(itemData?.image || itemData?.inventoryItem?.image);
      setImgUrl(data);
    };
    fetchImgUrl();
  }, [itemData]);

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
      setRelatedProducts(response.data.relatedProducts);
      setSelectedOption(response.data.data.options[0]);
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

  const onAddToCart = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      const resultAction = await dispatch(
        addItemToCartAsync({
          cartId: cart.id,
          item: {
            quantity,
            item: itemData,
            id: itemData?.id,
            option: selectedOption,
          },
        }),
      );

      if (addItemToCartAsync.fulfilled.match(resultAction)) {
        const { message } = resultAction.payload;
        showNotification('success', message);
        // setCartId(data.id);
      } else if (addItemToCartAsync.rejected.match(resultAction)) {
        const error: any = resultAction.payload || resultAction.error;
        showNotification(
          'error',
          error?.message || 'Failed to add item to cart',
        );
      }
      setIsAdding(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong. Please try again later');
      setIsAdding(false);
    }
  };

  const renderProductInfo = () => {
    return (
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography
          variant="h5"
          fontWeight="medium"
          // sx={{ color: landingPagePrimaryColor }}
        >
          {itemData?.name || itemData?.inventoryItem?.name}
        </Typography>

        {itemData?.options && itemData.options.length > 0 ? (
          <Grid container spacing={2} sx={{ width: '100%' }}>
            {itemData.options.map((option: any, index: number) => (
              <Grid item xs={6} md={4} key={index}>
                <ItemButton
                  item={option}
                  onClick={() => setSelectedOption(option)}
                  containerStyle={{
                    backgroundColor: grey[100],
                    border: `3px solid ${selectedOption?.id === option.id ? primaryColor : 'transparent'}`,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ mt: 4, color: landingPagePrimaryColor }}
          >
            {itemData?.availability ? `$${itemData?.price}` : 'N/A'}
          </Typography>
        )}

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
            Want a better prices? Unlock wholesale savings -{' '}
            <a href="/account/application-form">Apply now</a>
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
            <LoadingButton
              fullWidth
              loading={isAdding}
              variant="contained"
              onClick={onAddToCart}
              disabled={!itemData?.availability}
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
              {itemData?.availability ? 'Add to Cart' : 'Out of stock'}
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderRelatedItems = () => {
    return (
      <>
        <Typography
          variant="h6"
          fontWeight="semibold"
          textAlign="center"
          // sx={{ color: landingPagePrimaryColor }}
        >
          Don't miss these favorites
        </Typography>

        <Box
          display="flex"
          flexDirection="row"
          gap={4}
          sx={{ overflowX: 'scroll', whiteSpace: 'nowrap', }}
        >
          {relatedProducts.map((item) => (
            <Box key={item.id} sx={{ width: 200 }}>
              <ProductListing
                product={item}
                onClick={() => {}}
                showNotification={showNotification}
              />
            </Box>
          ))}
        </Box>
      </>
    );
  };

  if (isLoading) {
    return (
      <NavbarWrapper>
        <LoadingComponent />
      </NavbarWrapper>
    );
  }

  return (
    <NavbarWrapper>
      {NotificationComp}
      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        sx={{ maxWidth: maxWidth, mx: 'auto', p: 4 }}
      >
        <Grid container rowGap={2} columnSpacing={2}>
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
              src={imgUrl}
              alt={itemData?.inventoryItem.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {renderProductInfo()}
          </Grid>
        </Grid>
        {renderRelatedItems()}
      </Box>
      {/* <Footer /> */}
    </NavbarWrapper>
  );
}
