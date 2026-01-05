import {
  Divider,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Tooltip,
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
import React, { useMemo, useState } from 'react';
import UnitRadio from './Radio/UnitRadio';
import { FileTextIcon, Trash2Icon } from 'lucide-react';
import { gstRate, pstRate } from '@/app/lib/constant';
import ReceivedProgress from './ReceivedProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { green, red } from '@mui/material/colors';
import EditNote from './Modals/edit/EditNote';

interface IProps {
  item: any;
  selectedItems: any;
  setSelectedItems: any;
  isEditMode?: boolean;
  index: number;
}

export const POItemRow = ({
  item,
  selectedItems,
  setSelectedItems,
  isEditMode,
  index,
}: IProps) => {
  const [isOpenEditPOItemNote, setIsOpenEditPOItemNote] =
    useState<boolean>(false);
  const xsDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const calculateItemTotal = (item: any) => {
    const total = (item.costPerItem + item.tax) * item.orderedQty;
    return total;
  };

  const onDeleteItem = (removedIndex: number) => {
    setSelectedItems(
      selectedItems.filter((i: any, index: number) => index !== removedIndex),
    );
  };

  const onChangeItem = (updatedIndex: number, field: string, value: any) => {
    const newItems = selectedItems.map((i: any, index: number) => {
      // Id here is equal to vendorItemId
      if (index === updatedIndex) {
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
    <>
      <EditNote
        open={isOpenEditPOItemNote}
        onClose={() => setIsOpenEditPOItemNote(false)}
        item={item}
        onUpdateNote={(note: string) => {
          onChangeItem(index, 'note', note);
        }}
        title="PO Item Note"
      />
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
              <Typography variant="h6">
                {item?.inventoryItem?.sku
                  ? `${item?.inventoryItem?.sku} | ${item?.inventoryItem?.name}`
                  : item?.inventoryItem?.name}
              </Typography>

              <Box display="flex" gap={1}>
                <Tooltip title={item?.note || 'N/A'}>
                  <IconButton onClick={() => setIsOpenEditPOItemNote(true)}>
                    <FileTextIcon />
                  </IconButton>
                </Tooltip>
                {xsDown && (
                  <IconButton onClick={() => onDeleteItem(index)}>
                    <Trash2Icon />
                  </IconButton>
                )}
              </Box>
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
                    onChangeItem(index, 'orderedQty', Number(e.target.value))
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
                    onChangeItem(index, 'costPerItem', Number(e.target.value))
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
                    onChangeItem(index, 'tax', Number(e.target.value))
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
              <IconButton onClick={() => onDeleteItem(index)}>
                <Trash2Icon />
              </IconButton>
            </Grid>
          )}
        </Grid>

        <Divider />
      </Box>
    </>
  );
};

export const POItemRowDisplay = ({ item }: any) => {
  const [anchorEl, setAnchorEl] = useState<any>(null);

  const itemTotal = useMemo(() => {
    return (item?.costPerItem || 0) * (item?.receivedQty || 0);
  }, [item]);

  const onMouseOver = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const onMouseOut = () => {
    setAnchorEl(null);
  };

  return (
    <TableRow sx={{ alignItems: 'flex-start' }}>
      <TableCell>
        {item?.inventoryItem?.sku
          ? `${item?.inventoryItem?.sku} | ${item?.inventoryItem?.name}`
          : item?.inventoryItem?.name}
      </TableCell>
      <TableCell sx={{ width: 20 }}>
        {item?.note && (
          <Tooltip title={item?.note || 'N/A'}>
            <FileTextIcon size={16} />
          </Tooltip>
        )}
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1} alignItems="center" width="100%">
          <ReceivedProgress
            receivedQty={item?.receivedQty || 0}
            rejectedQty={item?.rejectedQty || 0}
            orderedQty={item?.orderedQty || 0}
          />
        </Box>
        <Box>
          <Typography variant="caption" sx={{ width: '100%' }}>
            {(item?.receivedQty || 0) + (item?.rejectedQty || 0)} /{' '}
            {item?.orderedQty || 0}
          </Typography>

          <IconButton onClick={onMouseOver}>
            <KeyboardArrowDownIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onMouseOut}>
            <MenuItem>
              <Box display="flex" gap={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: green[500],
                    borderRadius: '50%',
                  }}
                />
                <Typography>Received</Typography>
                <Typography>{item?.receivedQty || 0}</Typography>
              </Box>
            </MenuItem>
            <MenuItem>
              <Box display="flex" gap={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: red[500],
                    borderRadius: '50%',
                  }}
                />
                <Typography>Rejected</Typography>
                <Typography>{item?.rejectedQty || 0}</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>
      </TableCell>
      <TableCell>
        <Typography>${item?.costPerItem?.toFixed(2) || 0}</Typography>
      </TableCell>
      <TableCell>
        <Typography>${item?.tax?.toFixed(2) || 0}</Typography>
      </TableCell>
      <TableCell>
        <Typography>${itemTotal?.toFixed(2) || 0}</Typography>
      </TableCell>
    </TableRow>
  );
};
