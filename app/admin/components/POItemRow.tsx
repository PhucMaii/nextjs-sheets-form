import {
  Divider,
  TableCell,
  TableRow,
  useMediaQuery,
} from '@mui/material';
import { IconButton } from '@mui/material';
import {
  FormControl,
  OutlinedInput,
  InputLabel,
  Grid,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Box } from '@mui/material';
import React from 'react';
import UnitRadio from './Radio/UnitRadio';
import { Trash2Icon } from 'lucide-react';
import { gstRate, pstRate } from '@/app/lib/constant';
import ReceivedProgress from './ReceivedProgress';

interface IProps {
  item: any;
  selectedItems: any;
  setSelectedItems: any;
  isEditMode?: boolean;
}

export const POItemRow = ({
  item,
  selectedItems,
  setSelectedItems,
  isEditMode,
}: IProps) => {
  const xsDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const calculateItemTotal = (item: any) => {
    const total = (item.costPerItem + item.tax) * item.orderedQty;
    return total;
  };

  const onDeleteItem = (item: any) => {
    setSelectedItems(
      selectedItems.filter(
        (i: any) => i.inventoryItemId !== item.inventoryItemId,
      ),
    );
  };

  const onChangeItem = (item: any, field: string, value: any) => {
    const newItems = selectedItems.map((i: any) => {
      // Id here is equal to vendorItemId
      if (i.id === item.id) {
        return {
          ...i,
          [field]: value,
          total: calculateItemTotal({ ...i, [field]: value }),
        };
      }

      return i;
    });

    setSelectedItems(newItems || []);
  };
  return (
    <Box key={item.id} display="flex" flexDirection="column" gap={2}>
      <Grid
        container
        key={item.id}
        display="flex"
        alignItems="center"
        spacing={2}
      >
        <Grid item xs={12}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography variant="h6">{item?.inventoryItem?.name}</Typography>
            {xsDown && (
              <IconButton onClick={() => onDeleteItem(item)}>
                <Trash2Icon />
              </IconButton>
            )}
          </Box>
        </Grid>
        {isEditMode && (
          <Grid item xs={12}>
            <UnitRadio
              units={item?.unit || []}
              value={JSON.stringify(item?.inventoryUnit || {})}
              onChange={(e: any) => {
                const newItems = selectedItems.map((i: any) => {
                  if (i.inventoryItemId === item.inventoryItemId) {
                    const tax =
                      JSON.parse(e.target.value).unitPrice *
                        (item?.inventoryItem?.hasGST ? gstRate : 0) +
                      JSON.parse(e.target.value).unitPrice *
                        (item?.inventoryItem?.hasPST ? pstRate : 0);

                    const costPerItem = JSON.parse(e.target.value).unitPrice;

                    const total = calculateItemTotal({
                      ...i,
                      costPerItem,
                      tax,
                    });
                    return {
                      ...i,
                      inventoryUnit: JSON.parse(e.target.value),
                      costPerItem,
                      tax,
                      total,
                    };
                  }
                  return i;
                });

                setSelectedItems(newItems);
              }}
            />
          </Grid>
        )}
        <Grid item xs={3.8} lg={3}>
          {isEditMode ? (
            <FormControl fullWidth>
              <InputLabel htmlFor="item-quantity">Quantity</InputLabel>
              <OutlinedInput
                id="item-quantity"
                size="small"
                placeholder="Quantity"
                label="Quantity"
                sx={{ width: '100%' }}
                value={item?.orderedQty || 0}
                onChange={(e) =>
                  onChangeItem(item, 'orderedQty', Number(e.target.value))
                }
              />
            </FormControl>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap={1}
            >
              <ReceivedProgress
                receivedQty={item?.receivedQty || 0}
                rejectedQty={item?.rejectedQty || 0}
                orderedQty={item?.orderedQty || 0}
              />
              <Typography>
                {(item?.receivedQty || 0) + (item?.rejectedQty || 0)} /{' '}
                {item?.orderedQty || 0}
              </Typography>
            </Box>
          )}
        </Grid>
        <Grid item xs={3.8} lg={3}>
          {isEditMode ? (
            <FormControl fullWidth>
              <InputLabel htmlFor="item-cost">Cost</InputLabel>
              <OutlinedInput
                id="item-cost"
                size="small"
                placeholder="Cost"
                sx={{ width: '100%' }}
                value={item?.costPerItem || 0}
                startAdornment={
                  <InputAdornment position="start">
                    <Typography>$</Typography>
                  </InputAdornment>
                }
                type="number"
                onChange={(e) =>
                  onChangeItem(item, 'costPerItem', Number(e.target.value))
                }
                label="Cost"
              />
            </FormControl>
          ) : (
            <Typography>${item?.costPerItem?.toFixed(2) || 0}</Typography>
          )}
        </Grid>
        <Grid item xs={3.8} lg={3}>
          {isEditMode ? (
            <FormControl fullWidth>
              <InputLabel htmlFor="item-tax">Tax</InputLabel>
              <OutlinedInput
                id="item-tax"
                size="small"
                placeholder="Tax"
                sx={{ width: '100%' }}
                value={item?.tax || 0}
                startAdornment={
                  <InputAdornment position="start">
                    <Typography>$</Typography>
                  </InputAdornment>
                }
                onChange={(e) =>
                  onChangeItem(item, 'tax', Number(e.target.value))
                }
                label="Tax"
                type="number"
              />
            </FormControl>
          ) : (
            <Typography>${item?.tax?.toFixed(2) || 0}</Typography>
          )}
        </Grid>
        <Grid item xs={11} lg={2} textAlign="right">
          <Typography>Total: ${item?.total?.toFixed(2) || 0}</Typography>
        </Grid>
        {!xsDown && (
          <Grid item xs={1} lg={0.5} textAlign="right">
            <IconButton onClick={() => onDeleteItem(item)}>
              <Trash2Icon />
            </IconButton>
          </Grid>
        )}
      </Grid>

      <Divider />
    </Box>
  );
};

export const POItemRowDisplay = ({ item }: any) => {

  return (
    <TableRow sx={{ alignItems: 'flex-start' }}>
      <TableCell>{item?.inventoryItem?.name}</TableCell>
      <TableCell>
        <Box display="flex" gap={1} alignItems="center" width="100%">
          <ReceivedProgress
            receivedQty={item?.receivedQty || 0}
            rejectedQty={item?.rejectedQty || 0}
            orderedQty={item?.orderedQty || 0}
          />
          <Typography variant="caption" sx={{ width: '100%' }}>
            {(item?.receivedQty || 0) + (item?.rejectedQty || 0)} /{' '}
            {item?.orderedQty || 0}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography>${item?.costPerItem?.toFixed(2) || 0}</Typography>
      </TableCell>
      <TableCell>
        <Typography>${item?.tax?.toFixed(2) || 0}</Typography>
      </TableCell>
      <TableCell>
        <Typography>${item?.total?.toFixed(2) || 0}</Typography>
      </TableCell>
    </TableRow>
  );
};
