import { generateImgUrl } from '@/app/lib/s3';
import { RootState } from '@/state/store';
import {
  Box,
  FormGroup,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const CartItemDisplay = ({item}: {item: any}) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    setImgUrl(generateImgUrl(item?.item?.image || item?.item?.inventoryItem?.image || '/images/landing/image_not_found.jpeg', false));
  }, [item]);

  return (
    <Box
    display="flex"
    alignItems="flex-start"
    justifyContent="space-between"
    key={item.id}
  >
    <Box display="flex" gap={1}>
      <img
        src={imgUrl}
        style={{ width: '100px', height: '100%', objectFit: 'contain' }}
      />
      <Box>
        <Typography fontWeight="bold">
          {item?.item?.name || item?.item?.inventoryItem?.name}
        </Typography>
        {item?.option && (
          <Typography variant="body2">{item?.option?.name}</Typography>
        )}
        <Typography variant="body2">x{item.quantity}</Typography>
      </Box>
    </Box>
    {/* <Typography fontWeight="bold">
      ${((item?.option?.price || item?.item?.price) * item?.quantity)?.toFixed(2)}
    </Typography> */}
    <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
      {(item?.option?.isShowDiscount || item?.item?.isShowDiscount) && (
        <Typography
          variant="h6"
          fontWeight="bold"
          style={{ textDecoration: 'line-through' }}
        >
          ${((item?.option?.prevPrice || item?.item?.prevPrice) * item?.quantity)?.toFixed(2)}
        </Typography>
      )}
      <Typography
        variant="h6"
        fontWeight="bold"
        style={{
          color: (item?.option?.isShowDiscount || item?.item?.isShowDiscount) ? 'red' : 'black',
        }}
      >
        ${((item?.option?.price || item?.item?.price) * item?.quantity)?.toFixed(2)}
      </Typography>
    </Box>
  </Box>
  );
};

export default function useCart(defaultNote?: string) {
  const [note, setNote] = useState(defaultNote || '');
  const cart = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    if (defaultNote) {
      setNote(defaultNote);
    }
  }, [defaultNote]);

  const renderDisplayTotal = useCallback(() => {
    return (
      <Box display="flex" flexDirection="column" gap={2} mt={4}>
        {cart && cart?.discount > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Discount: </Typography>
            <Typography>-${cart.discount.toFixed(2)} </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Subtotal: </Typography>
          <Typography>${cart?.subtotal?.toFixed(2)} </Typography>
        </Box>
        {cart?.shippingFee > 0 && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography>Shipping Fee: </Typography>
            <Typography>${cart?.shippingFee?.toFixed(2)} </Typography>
          </Box>
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>PST (7%): </Typography>
          <Typography>${cart?.PST?.toFixed(2)} </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>GST (5%): </Typography>
          <Typography>${cart?.GST?.toFixed(2)} </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Total: </Typography>
          <Typography variant="h5">${cart?.totalPrice?.toFixed(2)} </Typography>
        </Box>
      </Box>
    );
  }, [cart]);

  const renderItemsDisplay = useCallback(() => {
    return (
      <Box display="flex" flexDirection="column" gap={2} mt={4}>
        {cart?.items?.map((item) => (
          <CartItemDisplay key={item.id} item={item} />
        ))}
      </Box>
    );
  }, [cart]);

  const renderNoteInput = useCallback(() => {
    return (
      <Box>
        <FormGroup>
          <InputLabel htmlFor="note">Note</InputLabel>
          <TextField
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            minRows={3}
            placeholder="Leave note for us..."
          />
        </FormGroup>
      </Box>
    );
  }, [note, cart]);

  return {
    cart,
    renderDisplayTotal,
    renderItemsDisplay,
    renderNoteInput,
    note,
  };
}
