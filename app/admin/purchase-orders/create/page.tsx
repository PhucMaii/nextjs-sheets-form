'use client';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IVendor } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL, PO_STATUS } from '@/app/utils/enum';
import { ShadowSection } from '../../reports/styled';
import { generateRecommendDate } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import { Trash2Icon } from 'lucide-react';
import { gstRate, pstRate } from '@/app/lib/constant';

export default function CreatePO() {
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [po, setPO] = useState<any>({
    status: PO_STATUS.ON_HOLD,
    discount: 0,
    totalCost: 0,
    tax: 0,
    subtotal: 0,
    note: '',
  });
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);

  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up('md'));
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const xlUp = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));

  const { date: estArrival, SelectDate } = useSelectDate(
    generateRecommendDate(),
  );
  const { showNotification, NotificationComp } = useNotification();

  const costSummary = useMemo(() => {
    if (!po.items || po.items.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        totalCost: 0,
      };
    }

    const subtotal = po.items.reduce((acc: number, item: any) => {
      return acc + item.costPerItem * item.orderedQty;
    }, 0);

    const tax = po.items.reduce((acc: number, item: any) => {
      return acc + item.tax * item.orderedQty;
    }, 0);

    const totalCost = subtotal + tax;

    return {
      subtotal,
      tax,
      totalCost,
    };
  }, [po]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/vendors`);

      if (response.data.data) {
        setVendors(response.data.data);
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  const onSelectItem = (newItems: any) => {
    const itemWithCostAndTax = newItems.map((item: any) => {
      const ratioOf1 = item.unit.find((unit: any) => {
        return unit.ratio === 1;
      });

      const isGST = item.inventoryItem.hasGST;
      const isPST = item.inventoryItem.hasPST;

      const tax =
        ratioOf1.unitPrice * (isGST ? gstRate : 0) +
        ratioOf1.unitPrice * (isPST ? pstRate : 0);

      return {
        ...item,
        orderedQty: 1,
        costPerItem: ratioOf1.unitPrice,
        tax,
        total: (ratioOf1.unitPrice + tax) * 1,
      };
    });

    setPO((prevState: any) => ({
      ...prevState,
      items: itemWithCostAndTax,
    }));
  };

  const calculateItemTotal = (item: any) => {
    const total = (item.costPerItem + item.tax) * item.orderedQty;
    return total;
  };

  const onChangeItem = (item: any, field: string, value: any) => {
    const newItems = po.items.map((i: any) => {
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

    setPO((prevState: any) => ({
      ...prevState,
      items: newItems,
    }));
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Box
        sx={{
          width: xlUp ? 1200 : lgUp ? 800 : mdUp ? 600 : '100%',
          mx: 'auto',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="semibold">
            Create Purchase Order
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <ShadowSection
              sx={{ width: '100%' }}
              display="flex"
              flexDirection={'column'}
              gap={2}
            >
              {/* Vendor Selection */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Vendors</Typography>
                <Autocomplete
                  options={vendors}
                  getOptionLabel={(option) => option.name}
                  value={selectedVendor}
                  renderInput={(params) => (
                    <TextField {...params} label="Vendors" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Typography>{option.name}</Typography>
                      </li>
                    );
                  }}
                  onChange={(event, newValue) => {
                    setSelectedVendor(newValue);
                  }}
                />
              </Box>

              {/* Est Arrival */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Est. Arrival</Typography>
                {SelectDate}
              </Box>
              {/* Items */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Search Items</Typography>
                <Autocomplete
                  size="small"
                  options={selectedVendor?.vendorItem || []}
                  getOptionLabel={(option) => option?.inventoryItem?.name || ''}
                  renderOption={(props, option, { selected }) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <FormControlLabel
                          label={option?.inventoryItem?.name}
                          control={<Checkbox checked={selected} />}
                        />
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Items" />
                  )}
                  multiple
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(event, newValue) => {
                    onSelectItem(newValue);
                  }}
                  disableCloseOnSelect
                />
              </Box>

              {/* Display items */}
              <Box display="flex" flexDirection="column" gap={1}>
                {po?.items &&
                  po?.items.length > 0 &&
                  po?.items.map((item: any) => {
                    return (
                      <Box
                        key={item.id}
                        display="flex"
                        flexDirection="column"
                        gap={2}
                      >
                        <Grid
                          container
                          key={item.id}
                          display="flex"
                          alignItems="center"
                          gap={1}
                          spacing={1}
                        >
                          <Grid item xs={12} lg={3}>
                            <Typography variant="h6">
                              {item?.inventoryItem?.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={3.8} lg={1.5}>
                            <OutlinedInput
                              size="small"
                              placeholder="Quantity"
                              sx={{ width: '100%' }}
                              value={item?.orderedQty || 0}
                              onChange={(e) =>
                                onChangeItem(
                                  item,
                                  'orderedQty',
                                  Number(e.target.value),
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={3.8} lg={1.5}>
                            <OutlinedInput
                              size="small"
                              placeholder="Cost"
                              sx={{ width: '100%' }}
                              value={item?.costPerItem?.toFixed(2) || 0}
                              startAdornment={
                                <InputAdornment position="start">
                                  <Typography>$</Typography>
                                </InputAdornment>
                              }
                              type="number"
                              onChange={(e) =>
                                onChangeItem(
                                  item,
                                  'costPerItem',
                                  Number(e.target.value),
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={3.8} lg={1.5}>
                            <OutlinedInput
                              size="small"
                              placeholder="Tax"
                              sx={{ width: '100%' }}
                              value={item?.tax?.toFixed(2) || 0}
                              startAdornment={
                                <InputAdornment position="start">
                                  <Typography>$</Typography>
                                </InputAdornment>
                              }
                              onChange={(e) =>
                                onChangeItem(
                                  item,
                                  'tax',
                                  Number(e.target.value),
                                )
                              }
                            />
                          </Grid>
                          <Grid item xs={10} lg={3} textAlign="right">
                            <Typography>
                              Total: ${item?.total?.toFixed(2) || 0}
                            </Typography>
                          </Grid>
                          <Grid item xs={1} lg={0.5} textAlign="right">
                            <IconButton>
                              <Trash2Icon />
                            </IconButton>
                          </Grid>
                        </Grid>

                        <Divider />
                      </Box>
                    );
                  })}
              </Box>
            </ShadowSection>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* Cost Summary */}
            <ShadowSection display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight="semibold">
                  Cost Summary
                </Typography>
                
                <Button>Discount</Button>
              </Box>
              {/* Note */}
              <TextField
                label="Note"
                placeholder="Leave a note..."
                multiline
                rows={2}
                sx={{ width: '100%' }}
                onChange={(e) =>
                  setPO((prevState: any) => ({
                    ...prevState,
                    note: e.target.value,
                  }))
                }
              />
              <Box display="flex" flexDirection="column" gap={1}>
                {po?.discount ? (
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Discount</Typography>
                    <Typography>-${po?.discount?.toFixed(2) || 0}</Typography>
                  </Box>
                ) : null}
                <Box display="flex" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>${costSummary?.subtotal?.toFixed(2) || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Tax</Typography>
                  <Typography>${costSummary?.tax?.toFixed(2) || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total</Typography>
                  <Typography>${costSummary?.totalCost?.toFixed(2) || 0}</Typography>
                </Box>
              </Box>
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </Sidebar>
  );
}
