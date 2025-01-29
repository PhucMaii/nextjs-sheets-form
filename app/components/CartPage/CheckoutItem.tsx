import { generateImgUrl } from '@/app/lib/s3';
import { ICartItem } from '@/app/utils/type';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { Box, Button, Grid, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import React, { useEffect, useMemo, useState } from 'react';

interface IProps {
  item: ICartItem;
}

export default function CheckoutItem({ item }: IProps) {
  const [quantity, setQuantity] = useState<number>(item.quantity);

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

  return (
    <>
      <Grid item xs={6}>
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
    </>
  );
}
