'use client';
import {
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  OutlinedInput,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ShadowSection } from '../../reports/styled';
import AddPODiscount from '../../components/Modals/add/AddPODiscount';
import { IPurchaseOrder } from '@/app/utils/type';
import { useParams } from 'next/navigation';
import { API_URL, PO_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import useSelectDate from '@/hooks/useSelectDate';
import UnitRadio from '../../components/Radio/UnitRadio';
import { gstRate, pstRate } from '@/app/lib/constant';
import { Trash2Icon } from 'lucide-react';
import SellIcon from '@mui/icons-material/Sell';
import { Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/app/admin/components/Modals/ConfirmModal';
import { handleUpdatePOStatus } from '@/app/utils/purchase-orders';

export default function PurchaseOrder() {
  const { id }: any = useParams();
  const router = useRouter();

  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isOpenPODiscount, setIsOpenPODiscount] = useState(false);
  const [isOpenRemovePODiscount, setIsOpenRemovePODiscount] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [po, setPO] = useState<IPurchaseOrder | null>(null);
  // const [vendorItemSelection, setVendorItemSelection] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { showNotification, NotificationComp } = useNotification();
  const { SelectDate } = useSelectDate(po?.estArrival);

  useEffect(() => {
    if (po?.poItems) {
      const newSelectedItems = po?.poItems.map((item: any) => {
        const vendorItem = po?.vendor?.vendorItem.find(
          (vendorItem: any) =>
            vendorItem.inventoryItemId === item.inventoryItemId,
        );

        return {
          ...vendorItem,
          orderedQty: item.orderedQty,
          costPerItem: item.costPerItem,
          tax: item?.tax || 0,
          total: item.total,
          inventoryUnit: item?.inventoryUnit,
        };
      });
      setSelectedItems(newSelectedItems);
    }
  }, [po]);

  const costSummary = useMemo(() => {
    if (!selectedItems || selectedItems.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        totalCost: 0 - (po?.discount || 0),
      };
    }

    const subtotal = selectedItems.reduce((acc: number, item: any) => {
      return acc + item.costPerItem * item.orderedQty;
    }, 0);

    const tax = selectedItems.reduce((acc: number, item: any) => {
      return acc + (item?.tax || 0) * (item?.orderedQty || 1);
    }, 0);

    const totalCost = subtotal + tax - (po?.discount || 0);

    return {
      subtotal,
      tax,
      totalCost,
    };
  }, [selectedItems]);

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await axios.get(
        `${API_URL.ADMIN}/purchase-orders?id=${id}`,
      );
      setPO(response.data.data);
      setIsInitialized(false);
    } catch (error: any) {
      console.log(error);
      showNotification(
        'error',
        error?.response?.data?.message || 'Error fetching purchase order',
      );
    }
  };

  const onSelectItem = (newItems: any) => {
    const itemWithCostAndTax = newItems.map((item: any) => {
      // Check if the item is already in the PO
      const existingItem = selectedItems.find(
        (poItem: any) => poItem.inventoryItemId === item.inventoryItemId,
      );

      if (existingItem) {
        return { ...existingItem };
      }

      const inventoryUnit = item?.unit[0];

      const isGST = item.inventoryItem.hasGST;
      const isPST = item.inventoryItem.hasPST;

      const tax =
        inventoryUnit?.unitPrice * (isGST ? gstRate : 0) +
        inventoryUnit?.unitPrice * (isPST ? pstRate : 0);

      return {
        ...item,
        orderedQty: 1,
        costPerItem: inventoryUnit?.unitPrice,
        tax,
        total: (inventoryUnit?.unitPrice + tax) * 1,
        inventoryUnit: item?.unit[0],
      };
    });

    setSelectedItems(itemWithCostAndTax);

    // setPO((prevState: any) => ({
    //   ...prevState,
    //   poItems: itemWithCostAndTax,
    // }));
  };

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

  const handleSaveItems = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/purchase-orders`, {
        id: po?.id,
        items: selectedItems,
        discount: po?.discount,
        estArrival: po?.estArrival,
        note: po?.note,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      fetchPurchaseOrder();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log(error);
      showNotification('error', 'Error saving items');
    } finally {
      setIsSaving(false);
    }
  };

  const markAsOrdered = async () => {
    if (!po?.id) {
      showNotification('error', 'Purchase order not found');
      return;
    }

    setIsUpdatingStatus(true);

    const response = await handleUpdatePOStatus(po?.id, PO_STATUS.ORDERED);

    if (response) {
      showNotification('success', 'Purchase order updated');
    } else {
      showNotification('error', 'Failed to update purchase order');
    }

    setIsUpdatingStatus(false);
  };

  const directToReceive = () => {
    router.push(`/admin/purchase-orders/${id}/receive`);
  };

  return (
    <Sidebar>
      <AddPODiscount
        open={isOpenPODiscount}
        onClose={() => setIsOpenPODiscount(false)}
        addDiscount={(discount: number) => {
          setPO((prevState: any) => ({
            ...prevState,
            discount,
          }));
        }}
      />
      <ConfirmModal
        open={isOpenRemovePODiscount}
        onClose={() => setIsOpenRemovePODiscount(false)}
        title={`Are you sure you want to remove the $${po?.discount?.toFixed(2) || 0} discount?`}
        buttonLabel="Remove"
        showNotification={showNotification}
        handleSubmit={() => {
          setPO((prevState: any) => ({
            ...prevState,
            discount: null,
          }));
        }}
      />
      {NotificationComp}

      {isInitialized ? (
        <LoadingComponent />
      ) : (
        <Box
          sx={{
            width: '90%',
            maxWidth: 1920,
            mx: 'auto',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => router.push('/admin/purchase-orders')}>
              <ArrowBackIcon />
            </IconButton>
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5" fontWeight="semibold">
                #{po?.poNumber}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                {po?.status !== PO_STATUS.RECEIVED && (
                  <LoadingButton
                    loading={isUpdatingStatus}
                    onClick={() => {
                      if (po?.status === PO_STATUS.DRAFT || po?.status === PO_STATUS.CANCELLED) {
                        markAsOrdered();
                      } else if (po?.status === PO_STATUS.ORDERED) {
                        directToReceive();
                      }
                    }}
                    variant="outlined"
                  >
                    {po?.status === PO_STATUS.DRAFT || po?.status === PO_STATUS.CANCELLED
                      ? 'Mark as ordered'
                      : po?.status === PO_STATUS.ORDERED
                        ? 'Receive inventory'
                        : ''}
                  </LoadingButton>
                )}
                <LoadingButton
                  loading={isSaving}
                  onClick={handleSaveItems}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={2} mt={2}>
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
                  <Typography variant="h5">{po?.vendor?.name}</Typography>
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
                    value={selectedItems}
                    options={po?.vendor?.vendorItem || []}
                    getOptionLabel={(option) =>
                      option?.inventoryItem?.name || ''
                    }
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
                <Box display="flex" flexDirection="column" gap={2}>
                  {selectedItems &&
                    selectedItems.length > 0 &&
                    selectedItems.map((item: any) => {
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
                            spacing={1}
                          >
                            <Grid item xs={12}>
                              <Typography variant="h6">
                                {item?.inventoryItem?.name}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <UnitRadio
                                units={item?.unit || []}
                                value={JSON.stringify(
                                  item?.inventoryUnit || {},
                                )}
                                onChange={(e: any) => {
                                  const newItems = selectedItems.map(
                                    (i: any) => {
                                      if (
                                        i.inventoryItemId ===
                                        item.inventoryItemId
                                      ) {
                                        const tax =
                                          JSON.parse(e.target.value).unitPrice *
                                            (item?.inventoryItem?.hasGST
                                              ? gstRate
                                              : 0) +
                                          JSON.parse(e.target.value).unitPrice *
                                            (item?.inventoryItem?.hasPST
                                              ? pstRate
                                              : 0);

                                        const costPerItem = JSON.parse(
                                          e.target.value,
                                        ).unitPrice;

                                        const total = calculateItemTotal({
                                          ...i,
                                          costPerItem,
                                          tax,
                                        });
                                        return {
                                          ...i,
                                          inventoryUnit: JSON.parse(
                                            e.target.value,
                                          ),
                                          costPerItem,
                                          tax,
                                          total,
                                        };
                                      }
                                      return i;
                                    },
                                  );

                                  setSelectedItems(newItems);
                                }}
                              />
                            </Grid>
                            <Grid item xs={3.8} lg={3}>
                              <FormControl fullWidth>
                                <InputLabel htmlFor="item-quantity">
                                  Quantity
                                </InputLabel>
                                <OutlinedInput
                                  id="item-quantity"
                                  size="small"
                                  placeholder="Quantity"
                                  label="Quantity"
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
                              </FormControl>
                            </Grid>
                            <Grid item xs={3.8} lg={3}>
                              <FormControl fullWidth>
                                <InputLabel htmlFor="item-cost">
                                  Cost
                                </InputLabel>
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
                                    onChangeItem(
                                      item,
                                      'costPerItem',
                                      Number(e.target.value),
                                    )
                                  }
                                  label="Cost"
                                />
                              </FormControl>
                            </Grid>
                            <Grid item xs={3.8} lg={3}>
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
                                    onChangeItem(
                                      item,
                                      'tax',
                                      Number(e.target.value),
                                    )
                                  }
                                  label="Tax"
                                  type="number"
                                />
                              </FormControl>
                            </Grid>
                            <Grid item xs={10} lg={2} textAlign="right">
                              <Typography>
                                Total: ${item?.total?.toFixed(2) || 0}
                              </Typography>
                            </Grid>
                            <Grid item xs={1} lg={0.5} textAlign="right">
                              <IconButton onClick={() => onDeleteItem(item)}>
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
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h6" fontWeight="semibold">
                    Cost Summary
                  </Typography>

                  <Button
                    startIcon={<SellIcon />}
                    onClick={() => setIsOpenPODiscount(true)}
                  >
                    Discount
                  </Button>
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

                      {/* <Box display="flex" alignItems="center" gap={1}> */}
                      <Typography
                        onClick={() => setIsOpenRemovePODiscount(true)}
                        sx={{ cursor: 'pointer' }}
                      >
                        -${po?.discount?.toFixed(2) || 0}
                      </Typography>
                      {/* <IconButton onClick={() => setPO((prevState: any) => ({
                          ...prevState,
                          discount: null,
                        }))}>
                          <Trash2Icon />
                        </IconButton> */}
                      {/* </Box> */}
                    </Box>
                  ) : null}
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Subtotal</Typography>
                    <Typography>
                      ${costSummary?.subtotal?.toFixed(2) || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Tax</Typography>
                    <Typography>
                      ${costSummary?.tax?.toFixed(2) || 0}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total</Typography>
                    <Typography>
                      ${costSummary?.totalCost?.toFixed(2) || 0}
                    </Typography>
                  </Box>
                </Box>
              </ShadowSection>
            </Grid>
          </Grid>
        </Box>
      )}
    </Sidebar>
  );
}
