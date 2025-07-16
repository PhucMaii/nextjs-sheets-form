import { Remove } from '@mui/icons-material';
import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect } from 'react';
import UnitRadio from '../../Radio/UnitRadio';
import { gstRate, pstRate } from '@/app/lib/constant';

export default function ItemRow({
  item,
  index,
  vendorItems,
  handleItemChange,
  removeExpenseItem,
  isLastItem,
  expenseItems,
}: {
  item: any;
  index: number;
  vendorItems: any[];
  handleItemChange: (id: number, field: string, value: any) => void;
  removeExpenseItem: (id: number) => void;
  isLastItem: boolean;
  expenseItems: any[];
}) {
  //   useEffect(() => {
  //     if (item.id !== -1) {
  //       const targetItem = vendorItems.find(
  //         (item: any) => item.id === Number(item.id),
  //       );
  //       handleItemChange(item.id, 'unit', targetItem?.unit || []);
  //     }
  //   }, [item.id]);

  return (
    <Box key={item.id} mb={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ mb: 1 }} htmlFor={`item-select-${index}`}>
              Item
            </InputLabel>
            <Select
              id={`item-select-${index}`}
              value={item.id}
              onChange={(e) => {
                const targetItem = vendorItems.find(
                  (item: any) => item.id === Number(e.target.value),
                );
                const ratioOf1 = targetItem?.unit.find(
                  (unit: any) => unit.ratio === 1,
                );
                handleItemChange(item.id, 'selectedItem', {
                  id: Number(e.target.value),
                  unit: targetItem?.unit || [],
                  inventoryUnit: ratioOf1 || {},
                  inventoryItem: targetItem?.inventoryItem || {},
                });
              }}
              fullWidth
              label="Item"
            >
              <MenuItem value={-1}>
                <em>Select item</em>
              </MenuItem>
              {vendorItems.map((item: any) => {
                const isSelected = expenseItems.find(
                  (expenseItem: any) => expenseItem.id === item.id,
                );
                return (
                  <MenuItem key={item.id} value={item.id} disabled={isSelected}>
                    {item.inventoryItem.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={1}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={item.quantity}
            onChange={(e) =>
              handleItemChange(item.id, 'quantity', Number(e.target.value))
            }
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="Unit Price"
            type="number"
            value={item?.unitPrice || 0}
            onChange={(e) =>
              handleItemChange(item.id, 'unitPrice', Number(e.target.value))
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>
        <Grid item xs={6} md={1}>
          <TextField
            fullWidth
            label="GST"
            value={item?.inventoryItem?.hasGST ? (item.total * gstRate)?.toFixed(2) : 0}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              readOnly: true,
            }}
            sx={{ backgroundColor: grey[50] }}
          />
        </Grid>
        <Grid item xs={6} md={1}>
          <TextField
            fullWidth
            label="PST"
            value={item?.inventoryItem?.hasPST ? (item.total * pstRate)?.toFixed(2) : 0}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              readOnly: true,
            }}
            sx={{ backgroundColor: grey[50] }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField
            fullWidth
            label="Total"
            value={item.total.toFixed(2)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              readOnly: true,
            }}
            sx={{ backgroundColor: grey[50] }}
          />
        </Grid>
        <Grid item xs={6} md={1}>
          <IconButton
            color="error"
            onClick={() => removeExpenseItem(item.id)}
            disabled={isLastItem}
          >
            <Remove />
          </IconButton>
        </Grid>

        <Grid item xs={12}>
          <UnitRadio
            units={item.unit || []}
            value={JSON.stringify(item.inventoryUnit || {})}
            onChange={(e: any) =>
              handleItemChange(
                item.id,
                'inventoryUnit',
                JSON.parse(e.target.value),
              )
            }
          />
        </Grid>
      </Grid>
      {!isLastItem && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
}
