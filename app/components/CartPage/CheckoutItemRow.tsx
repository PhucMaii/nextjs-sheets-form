import { generateImgUrl } from '@/app/lib/s3';
import { ICart, ICartItem } from '@/app/utils/type';
import { landingPagePrimaryColor } from '@/constant/landingPage';
import { ShowNotificationType } from '@/hooks/useNotification';
import { removeItemAsync, updateItemQuantity } from '@/state/cart/cartSlice';
import { AppDispatch } from '@/state/store';
import {
  Box,
  Button,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { green } from '@mui/material/colors';
import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

interface IProps {
  item: ICartItem;
  cart: ICart;
  showNotification: ShowNotificationType;
}

export default function CheckoutItemRow({ item, showNotification }: IProps) {
  const [img, setImg] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(item.quantity);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [targetItem, setTargetItem] = useState<ICartItem | null>(item);

  useEffect(() => {
    if (item?.item?.image || item?.item?.inventoryItem?.image) {
      generateImgUrl(item?.item?.image || item?.item?.inventoryItem?.image).then((img) => {
        setImg(img);
      });
    }
  }, [item]);

  useEffect(() => {
    if (item) {
      setTargetItem({
        ...item,
        item: {
          ...item.item,
          ...item?.option,
          name: item.item?.name,
        }
      });
    }
  }, [item]);

  const dispatch = useDispatch<AppDispatch>();

  const totalPrice = useMemo(() => {
    if (!targetItem) {
      return 0;
    }
    return quantity * targetItem?.item?.price;
  }, [quantity, targetItem]);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
    }
  }, [item]);

  useEffect(() => {
    if (quantity !== item.quantity) {
      onUpdateItemQuantity();
    }
  }, [quantity]);

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
      setIsLoading(true);
      const resultAction = await dispatch(
        removeItemAsync({
          itemId: item.id,
        }),
      );

      if (removeItemAsync.rejected.match(resultAction)) {
        const error: any = resultAction.payload || resultAction?.error;
        showNotification('error', error?.message || 'Fail to remove item');
      }

      setIsLoading(false);
      // onRemoveItemUI(item.id);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong. Please try again later');
    }
  };

  const onUpdateItemQuantity = async () => {
    try {
      setIsLoading(true);
      const resultAction = await dispatch(
        updateItemQuantity({
          itemId: item.id,
          quantity,
        }),
      );

      if (updateItemQuantity.rejected.match(resultAction)) {
        const error: any = resultAction.payload || resultAction?.error;
        showNotification('error', error?.message || 'Fail to remove item');
      }
      // const response = await axios.put(`${API_URL.PUBLIC}/cart/update-cart-item`, {
      //   itemId: item.id,
      //   quantity
      // });

      // if (response.data.error) {
      //   showNotification('error', 'Something went wrong. ' + response?.data?.error);
      //   setIsLoading(false);
      //   return;
      // }

      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Something went wrong. ' + error?.response?.data?.error,
      );
      setIsLoading(false);
    }
  };

  return (
    <TableRow sx={{ opacity: isLoading ? 0.5 : 1 }}>
      {/* Name */}
      <TableCell>
        <Box display="flex" gap={2} alignItems="center">
          <Image
            style={{ width: '150px', height: '100%', objectFit: 'contain' }}
            src={img || ''}
            alt=""
            width={100}
            height={100}
            loading="lazy"
          />
          <Box display="flex" flexDirection="column">
            <Box
              component="a"
              aria-disabled={isLoading}
              href={isLoading ? undefined : `/products/${item.item.id}`}
              sx={{
                textDecoration: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                pointerEvents: isLoading ? 'none' : 'auto',
                color: 'inherit',
                '&:hover': {
                  textDecoration: 'underline',
                  color: landingPagePrimaryColor,
                },
              }}
            >
              <Typography variant="h6">
                {targetItem?.item?.name || targetItem?.item?.inventoryItem?.name}
              </Typography>
            </Box>

            {targetItem?.option && (
              <Typography variant="body2">
                {targetItem?.option?.name}
              </Typography>
            )}
          </Box>
        </Box>
      </TableCell>

      {/* Price */}
      <TableCell>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
          {targetItem?.item?.isShowDiscount && (
            <Typography
              variant="h6"
              fontWeight="bold"
              style={{ textDecoration: 'line-through' }}
            >
              ${targetItem?.item?.prevPrice?.toFixed(2)}
            </Typography>
          )}
          <Typography
            variant="h6"
            fontWeight="bold"
            style={{
              color: targetItem?.item?.isShowDiscount ? 'red' : 'black',
            }}
          >
            ${targetItem?.item?.price?.toFixed(2)}
          </Typography>
        </Box>
      </TableCell>

      {/* Quantity */}
      <TableCell>
        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="outlined"
            disabled={isLoading || quantity <= 1}
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
            disabled={isLoading}
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
      </TableCell>

      {/* Total price */}
      <TableCell>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ color: landingPagePrimaryColor }}
        >
          ${totalPrice?.toFixed(2)}
        </Typography>
      </TableCell>

      {/* Remove button */}
      <TableCell>
        <IconButton disabled={isLoading} onClick={onRemoveItem}>
          <Trash2Icon style={{ width: '25px', height: '25px' }} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
