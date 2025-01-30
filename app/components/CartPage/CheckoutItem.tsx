import { generateImgUrl } from '@/app/lib/s3';
import { API_URL } from '@/app/utils/enum';
import { ICart, ICartItem } from '@/app/utils/type';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { AlertColor, Box, Button, Grid, IconButton, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { CartItem } from '@prisma/client';
import axios from 'axios';
import { Loader2Icon, Trash2Icon } from 'lucide-react';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

interface IProps {
  item: ICartItem;
  setCart: Dispatch<SetStateAction<ICart | null>>;
  cart: ICart;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function CheckoutItem({ item, setCart, cart, showNotification }: IProps) {
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const totalPrice = useMemo(() => {
    return quantity * item.itemPreference.price;
  }, [quantity]);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
    }
  }, [item]);

  const onIncrement = () => {
    setQuantity((prevQty: number) => prevQty + 1);
  };

  const onDecrement = () => {
    if (quantity > 1) {
      setQuantity((prevQty: number) => prevQty - 1);
    }
  };

  const onRemoveItem = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${API_URL.PUBLIC}/cart/remove-item?itemId=${item.id}`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      onRemoveItemUI(item.id);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong. Please try again later');
    }
  }

  const onRemoveItemUI = (itemId: number) => {
    const newCartItemList = cart.items.filter((item: CartItem) => item.id !== itemId);

    setCart((prevState: any) => ({
      ...prevState,
      items: newCartItemList
    }))
  }

  return (
    <>
      <Grid item xs={5.5}>
        <Box display="flex" gap={2} alignItems="center">
          <img
            style={{ width: '150px', height: '100%', objectFit: 'contain' }}
            src={
              item.itemPreference?.image
                ? generateImgUrl(item.itemPreference.image)
                : ''
            }
            alt=""
          />
          <Typography variant="h6">
            {item.itemPreference.inventoryItem.name}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={2}>
        <Typography variant="h6" fontWeight="bold">
          ${item.itemPreference.price?.toFixed(2)}
        </Typography>
      </Grid>
      <Grid item xs={2} textAlign="center">
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            disabled={quantity <= 1}
            onClick={onDecrement}
            sx={{
              borderRadius: 1,
              width: '30px',
              height: '30px',
              p: 0,
              minWidth: 0,
              border: `1px solid ${green[800]}`,
              color: green[800],
              '&:hover': {
                backgroundColor: green[50],
                border: `1px solid ${green[800]}`,
              },
            }}
          >
            -
          </Button>
          <Typography variant="h6" fontWeight="normal">
            {quantity}
          </Typography>
          <Button
            variant="outlined"
            onClick={onIncrement}
            sx={{
              borderRadius: 1,
              width: '30px',
              height: '30px',
              p: 0,
              minWidth: 0,
              border: `1px solid ${green[800]}`,
              color: green[800],
              '&:hover': {
                backgroundColor: green[50],
                border: `1px solid ${green[800]}`,
              },
            }}
          >
            +
          </Button>
        </Box>
      </Grid>
      <Grid item xs={2}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          ${totalPrice?.toFixed(2)}
        </Typography>
      </Grid>
      <Grid item xs={0.5} textAlign="center" sx={{p: 0}}>
          <IconButton onClick={onRemoveItem}>
            {isDeleting ? 
            <Loader2Icon
              style={{
                animation: 'spin 1s linear infinite'
              }}
            /> : 
            <Trash2Icon style={{width: '25px', height: '25px'}} />}
          </IconButton>
      </Grid>
    </>
  );
}
