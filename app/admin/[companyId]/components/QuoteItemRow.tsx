import { Divider } from '@mui/material';
import { IconButton } from '@mui/material';
import { InputAdornment, TextField, Typography } from '@mui/material';
import { generateImgUrl } from '@/app/lib/s3';
import { Grid } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { Trash2Icon } from 'lucide-react';
import UnitRadio from './Radio/UnitRadio';

interface IProps {
  item: any;
  onUpdateItem: (item: any) => void;
  onRemoveItem: (item: any) => void;
}

const QuoteItemRow = ({ item, onUpdateItem, onRemoveItem }: IProps) => {
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    generateImgUrl(item.image).then((url) => setImgUrl(url));
  }, [item.image]);

  return (
    <>
      <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {item?.image && (
          <img
            src={imgUrl}
            alt={item.name}
            width={50}
            height={50}
            style={{ borderRadius: 4 }}
          />
        )}
        <Typography sx={{ fontWeight: 'semibold' }}>{item.name}</Typography>
      </Grid>
      <Grid item xs={12}>
        <UnitRadio
          value={JSON.stringify(item?.unit)}
          units={item.units}
          onChange={(e: any) =>
            onUpdateItem({ ...item, unit: JSON.parse(e.target.value) })
          }
        />
      </Grid>

      <Grid item xs={5}>
        <TextField
          value={item.price}
          fullWidth
          onChange={(e) => onUpdateItem({ ...item, price: e.target.value })}
          type="number"
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      </Grid>

      <Grid item xs={5}>
        <TextField
          value={item.quantity}
          fullWidth
          onChange={(e) => onUpdateItem({ ...item, quantity: e.target.value })}
        />
      </Grid>

      <Grid item xs={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 'semibold' }}>
          ${item.price * item.quantity}
        </Typography>
        <IconButton size="small" onClick={() => onRemoveItem(item)}>
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
    Object.is(prevProps.item, nextProps.item) &&
    Object.is(prevProps.onUpdateItem, nextProps.onUpdateItem) &&
    Object.is(prevProps.onRemoveItem, nextProps.onRemoveItem)
  );
});
