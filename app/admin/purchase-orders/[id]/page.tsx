'use client';
import {
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  TableHead,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  Table,
} from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { gstRate, pstRate } from '@/app/lib/constant';
import SellIcon from '@mui/icons-material/Sell';
import { Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import { LoadingButton } from '@mui/lab';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/app/admin/components/Modals/ConfirmModal';
import { handleUpdatePOStatus } from '@/app/utils/purchase-orders';
import { POItemRowDisplay, POItemRow } from '../../components/POItemRow';
import { POInvoice } from '../../components/Printing/POInvoice';
import { useReactToPrint } from 'react-to-print';

export default function PurchaseOrder() {
  const { id }: any = useParams();
  const router = useRouter();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(true);
  const [isOpenPODiscount, setIsOpenPODiscount] = useState(false);
  const [isOpenRemovePODiscount, setIsOpenRemovePODiscount] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [po, setPO] = useState<IPurchaseOrder | null>(null);
  // const [vendorItemSelection, setVendorItemSelection] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const { showNotification, NotificationComp } = useNotification();
  const { date, SelectDate } = useSelectDate(po?.estArrival);

  const poInvoiceRef = useRef(null);

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
          receivedQty: item?.receivedQty || 0,
          rejectedQty: item?.rejectedQty || 0,
        };
      });
      setSelectedItems(newSelectedItems);
    }
  }, [po]);

  useEffect(() => {
    if (po?.status === PO_STATUS.DRAFT || po?.status === PO_STATUS.CANCELLED) {
      setIsEditMode(true);
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

  const handleSaveItems = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/purchase-orders`, {
        id: po?.id,
        items: selectedItems,
        discount: po?.discount,
        estArrival: date,
        note: po?.note,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      fetchPurchaseOrder();

      showNotification('success', response.data.message);
      setIsEditMode(false);
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
      showNotification('success', response.message);
      // If success -> marks as ordered
      setPO((prevState: any) => ({
        ...prevState,
        status: PO_STATUS.ORDERED,
      }));
    } else {
      showNotification('error', 'Failed to update purchase order');
    }

    setIsUpdatingStatus(false);
  };

  const directToReceive = () => {
    router.push(`/admin/purchase-orders/${id}/receive`);
  };

  const handlePrintInvoice = useReactToPrint({
    content: () => {
      return poInvoiceRef.current;
    },
  });

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
      {po && (
        <div style={{ display: 'none' }}>
          <POInvoice vendor={po?.vendor} po={po} ref={poInvoiceRef} />
        </div>
      )}
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
            <IconButton
              onClick={() => {
                if (
                  isEditMode &&
                  po?.status !== PO_STATUS.DRAFT &&
                  po?.status !== PO_STATUS.CANCELLED
                ) {
                  setIsEditMode(false);
                } else {
                  router.push('/admin/purchase-orders');
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h5" fontWeight="semibold">
                {isEditMode ? `Edit #${po?.poNumber}` : `#${po?.poNumber}`}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <LoadingButton
                  loading={isSaving}
                  onClick={() => {
                    if (isEditMode) {
                      handleSaveItems();
                    } else {
                      setIsEditMode(true);
                    }
                  }}
                  variant="outlined"
                >
                  {isEditMode ? 'Save' : 'Edit'}
                </LoadingButton>
                <Button onClick={handlePrintInvoice} variant="outlined">
                  Export PO
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isUpdatingStatus}
                  onClick={() => {
                    if (
                      po?.status === PO_STATUS.DRAFT ||
                      po?.status === PO_STATUS.CANCELLED
                    ) {
                      markAsOrdered();
                    } else {
                      directToReceive();
                    }
                  }}
                >
                  {po?.status === PO_STATUS.DRAFT ||
                  po?.status === PO_STATUS.CANCELLED
                    ? 'Mark as ordered'
                    : 'Receive Inventory'}
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
                {isEditMode ? (
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography>Search Items</Typography>
                    <Autocomplete
                      size="small"
                      value={selectedItems}
                      options={po?.vendor?.vendorItem || []}
                      getOptionLabel={(option) =>
                        option?.inventoryItem?.sku
                          ? `${option?.inventoryItem?.sku} | ${option?.inventoryItem?.name}`
                          : option?.inventoryItem?.name
                      }
                      renderOption={(props, option, { selected }) => {
                        const { key, ...optionProps } = props;
                        return (
                          <li key={key} {...optionProps}>
                            <FormControlLabel
                              label={option?.inventoryItem?.sku
                                ? `${option?.inventoryItem?.sku} | ${option?.inventoryItem?.name}`
                                : option?.inventoryItem?.name}
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
                ) : (
                  <Typography>Ordered Items</Typography>
                )}
                {/* Display items */}
                {isEditMode ? (
                  <>
                    {selectedItems.map((item: any) => {
                      return (
                        <POItemRow
                          item={item}
                          selectedItems={selectedItems}
                          setSelectedItems={setSelectedItems}
                          isEditMode={true}
                        />
                      );
                    })}
                  </>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Cost</TableCell>
                          <TableCell>Tax</TableCell>
                          <TableCell>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedItems.map((item: any) => {
                          return <POItemRowDisplay item={item} />;
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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
                  value={po?.note}
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
