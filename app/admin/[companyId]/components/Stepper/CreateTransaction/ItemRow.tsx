import { Remove } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';
import UnitRadio from '../../Radio/UnitRadio';

export default function ItemRow({
  item,
  index,
  vendorItems,
  handleItemChange,
  removeExpenseItem,
  isLastItem,
  expenseItems,
  isAllowChangeSellingPrice,
}: {
  item: any;
  index: number;
  vendorItems: any[];
  handleItemChange: (id: number, field: string, value: any) => void;
  removeExpenseItem: (id: number) => void;
  isLastItem: boolean;
  expenseItems: any[];
  isAllowChangeSellingPrice: boolean;
}) {

  return (
    <Box key={item.id} mb={2}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            {/* <InputLabel sx={{ mb: 1 }} htmlFor={`item-select-${index}`}>
              Item
            </InputLabel> */}
            <Autocomplete
              id={`item-select-${index}`}
              value={{
                name: item?.inventoryItem?.name,
                id: item.id,
                sku: item?.inventoryItem?.sku || 'N/A',
                isSelected:
                  expenseItems.some(
                    (expenseItem: any) => expenseItem.id === item.id,
                  ) || false,
                vendorItemId: item?.vendorItemId || item?.id,
              }}
              onChange={(e, value) => {
                const targetItem = vendorItems.find(
                  (item: any) => item.id === Number(value?.id),
                );

                if (!targetItem) {
                  return;
                }

                const ratioOf1 = targetItem?.unit.find(
                  (unit: any) => unit.ratio === 1,
                );
                handleItemChange(item.id, 'selectedItem', {
                  id: Number(targetItem?.id),
                  unit: targetItem?.unit || [],
                  inventoryUnit: ratioOf1 || {},
                  inventoryItem: targetItem?.inventoryItem || {},
                  vendorId: targetItem?.vendorId || null,
                  vendorItemId: targetItem?.id || null,
                });
              }}
              fullWidth
              // label="Item"
              options={vendorItems.map((item: any) => ({
                name: item?.inventoryItem?.name,
                id: item.id,
                vendorItemId: item.id,
                sku: item?.inventoryItem?.sku || 'N/A',
                isSelected: expenseItems.some(
                  (expenseItem: any) => expenseItem.id === item.id,
                ),
              }))}
              renderOption={(props, option) => {
                return (
                  <li {...props}>
                    <Typography variant="body2">
                      {option?.sku || 'N/A'} - {option.name}
                    </Typography>
                  </li>
                );
              }}
              getOptionLabel={(option) => {
                return `${option?.sku || 'N/A'} - ${option.name}`;
              }}
              getOptionDisabled={(option) => {
                return option.isSelected;
              }}
              renderInput={(params) => <TextField {...params} />}
            >
              {/* <MenuItem value={-1}>
                <em>Select item</em>
              </MenuItem>
              {vendorItems.map((item: any) => {
                const isSelected = expenseItems.find(
                  (expenseItem: any) => expenseItem.id === item.id,
                );
                return (
                  <MenuItem key={item.id} value={item.id} disabled={isSelected}>
                    {item.inventoryItem?.sku || 'N/A'} -{' '}
                    {item.inventoryItem.name}
                  </MenuItem>
                );
              })} */}
            </Autocomplete>
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
            value={item?.GST?.toFixed(2) || 0}
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
            value={item?.PST?.toFixed(2) || 0}
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
            value={item?.total?.toFixed(2) || 0}
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
            units={item.units || []}
            value={JSON.stringify(item?.unit || {})}
            onChange={(e: any) =>
              handleItemChange(item.id, 'unit', JSON.parse(e.target.value))
            }
          />
        </Grid>
        {isAllowChangeSellingPrice && (
          <Grid
            item
            xs={12}
            sx={{
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 1,
              p: 2,
              m: 2,
              backgroundColor: 'grey.50',
            }}
          >
            {item.isChangeSellingPrice && (
              <Alert severity="warning" sx={{ width: '100%' }}>
                <Typography variant="subtitle2">
                  It will update the selling price of all selling items with the
                  same inventory items.
                </Typography>
              </Alert>
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 2, sm: 2 },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.isChangeSellingPrice || false}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'isChangeSellingPrice',
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Change selling price"
                sx={{
                  mb: { xs: 0, sm: 0 },
                  flexShrink: 0,
                }}
              />
              {item.isChangeSellingPrice && (
                <Box
                  sx={{
                    width: { xs: '100%', sm: 'auto' },
                    minWidth: { xs: '100%', sm: 200 },
                    maxWidth: { xs: '100%', sm: 300 },
                  }}
                >
                  <TextField
                    fullWidth
                    label="Selling Price"
                    type="number"
                    value={item.sellingPrice || ''}
                    onChange={(e) =>
                      handleItemChange(
                        item.id,
                        'sellingPrice',
                        Number(e.target.value),
                      )
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    size="small"
                  />
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
      {!isLastItem && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
}
