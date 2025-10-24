import React from 'react';
import {
  Grid,
  Typography,
  Divider,
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import { Trash2Icon } from 'lucide-react';
import { ICreditItem } from '@/app/utils/type';

interface IProps {
  item: ICreditItem;
  categoryItems: any[];
  creditItems: ICreditItem[];
  setCreditItems: (items: ICreditItem[]) => void;
}

export default function CreditItem({
  item,
  categoryItems,
  creditItems,
  setCreditItems,
}: IProps) {

  const handleRemoveCreditItem = (id: number) => {
    setCreditItems(creditItems.filter((creditItem: ICreditItem) => creditItem.id !== id));
  };

  return (
    <Grid key={item.id} container spacing={2}>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Autocomplete
          options={categoryItems || []}
          getOptionLabel={(option: any) => option.name}
          renderInput={(params) => <TextField {...params} label="Item" />}
          value={item.categoryItem}
          onChange={(e, newValue: any) => {
            setCreditItems(
              creditItems.map((creditItem: ICreditItem | any) =>
                creditItem.id === item.id
                  ? {
                      ...creditItem,
                      categoryItem: newValue,
                      actualPrice: newValue.price,
                      isShowDiscount: true,
                      prevPrice: newValue.price,
                      priceDifference: newValue.price,
                      name: `${newValue.name} CREDIT`,
                      inventoryItem: newValue.inventoryItem,
                    }
                  : creditItem,
              ),
            );
          }}
          sx={{ width: '100%' }}
        />
      </Grid>
      <Grid item xs={12} md={2}>
        <TextField
          label="Quantity"
          value={item.quantity}
          onChange={(e) => {
            setCreditItems(
              creditItems.map((creditItem: ICreditItem | any) =>
                creditItem.id === item.id
                  ? {
                      ...creditItem,
                      quantity: Number(e.target.value),
                    }
                  : creditItem,
              ),
            );
          }}
          sx={{ width: '100%' }}
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography>Qty</Typography>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={5}>
        <TextField
          label="Price"
          value={item.price}
          onChange={(e) => {
            setCreditItems(
              creditItems.map((creditItem: ICreditItem | any) =>
                creditItem.id === item.id
                  ? {
                      ...creditItem,
                      price: Number(e.target.value),
                    }
                  : creditItem,
              ),
            );
          }}
          sx={{ width: '100%' }}
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography>$</Typography>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography
                  color="error"
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${item?.actualPrice}
                </Typography>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} md={1}>
        <Box display="flex" justifyContent="center">
          <IconButton
            onClick={() => handleRemoveCreditItem(item.id)}
            color="error"
          >
            <Trash2Icon style={{ width: 20, height: 20 }} />
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
