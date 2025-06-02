import { Divider } from '@mui/material';
import { IconButton } from '@mui/material';
import { InputAdornment, TextField, Typography } from '@mui/material';
import { generateImgUrl } from '@/app/lib/s3';
import { Grid } from '@mui/material';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { Trash2Icon } from 'lucide-react';
import UnitRadio from './Radio/UnitRadio';

interface QuoteItem {
  id: string;
  name: string;
  inventoryItem?: {
    name: string;
    image?: string;
    price?: number;
    quantity?: number;
    unit?: any;
    units?: any[];
  };
  inventoryUnit?: any;
  image?: string;
  price: number;
  quantity: number;
  unit: any;
  units: any[];
}

interface IProps {
  item: QuoteItem;
  onUpdateItem: (item: QuoteItem) => void;
  onRemoveItem: (item: QuoteItem) => void;
}

const QuoteItemRow = ({ item, onUpdateItem, onRemoveItem }: IProps) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    if (item?.image || item.inventoryItem?.image) {
      generateImgUrl(item?.image || item.inventoryItem?.image || '').then(
        (url) => setImgUrl(url),
      );
    }
  }, [item.image, item.inventoryItem?.image]);

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateItem({ ...item, unit: JSON.parse(e.target.value) });
    },
    [item, onUpdateItem],
  );

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateItem({ ...item, price: Number(e.target.value) });
    },
    [item, onUpdateItem],
  );

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateItem({ ...item, quantity: Number(e.target.value) });
    },
    [item, onUpdateItem],
  );

  const handleRemove = useCallback(() => {
    onRemoveItem(item);
  }, [item, onRemoveItem]);

  return (
    <>
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item?.image ||
          (item.inventoryItem?.image && (
            <img
              src={imgUrl}
              alt={item.inventoryItem?.name || item.name}
              width={50}
              height={50}
              style={{ borderRadius: 4 }}
            />
          ))}
        <Typography sx={{ fontWeight: 'semibold' }}>
          {item.inventoryItem?.name || item.name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <UnitRadio
          value={JSON.stringify(item?.unit || item?.inventoryUnit)}
          units={item.units || item.inventoryItem?.units || []}
          onChange={handleUnitChange}
        />
      </Grid>

      <Grid item xs={5}>
        <TextField
          value={item.price || item.inventoryItem?.price}
          fullWidth
          onChange={handlePriceChange}
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>

      <Grid item xs={5}>
        <TextField
          value={item.quantity || item.inventoryItem?.quantity}
          fullWidth
          onChange={handleQuantityChange}
          type="number"
        />
      </Grid>

      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 'semibold' }}>
          $
          {item.price
            ? (item.price * item.quantity).toFixed(2)
            : (
                (item.inventoryItem?.price || 0) *
                (item.inventoryItem?.quantity || 0)
              ).toFixed(2)}
        </Typography>
        <IconButton size="small" onClick={handleRemove}>
          <Trash2Icon style={{ width: 16, height: 16 }} />
        </IconButton>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
    </>
  );
};

export default memo(QuoteItemRow, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.quantity === nextProps.item.quantity &&
    JSON.stringify(prevProps.item.unit) ===
      JSON.stringify(nextProps.item.unit) &&
    prevProps.onUpdateItem === nextProps.onUpdateItem &&
    prevProps.onRemoveItem === nextProps.onRemoveItem
  );
});
