'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Divider,
  Button,
  TextField,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { Add, ArrowBack, Receipt, Save } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

// Import theme colors
import { error, neutral, primary } from '@/theme/color';

// Import existing components and utilities
import Sidebar from '../../components/Sidebar/Sidebar';
import useNotification from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { BorderSection, ShadowSection } from '../../reports/styled';
import useClients from '@/hooks/select/useClients';
import { CreditItem, CreditReport, CreditType } from '@prisma/client';
import useOrders from '@/hooks/select/useOrders';
import ErrorComponent from '../../components/ErrorComponent';
import { IItem } from '@/app/utils/type';
import DisplayFile from '../../components/Modals/DisplayFile';
import { grey } from '@mui/material/colors';
import useSelectCreditType from '@/hooks/select/useSelectCreditType';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Trash2Icon } from 'lucide-react';
import { LoadingButton } from '@mui/lab';

export default function CreateCreditReport() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { NotificationComp, showNotification } = useNotification();
  const { renderClientSearch, selectedClient } = useClients(companyId);
  const { renderCreditTypeSearch, selectedCreditType } = useSelectCreditType();

  // State management
  const [creditItems, setCreditItems] = useState<CreditItem[] | any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreditReport | any>({
    userId: 0,
    orderId: 0,
    reportedDate: dayjs().format('YYYY-MM-DD'),
    type: CreditType.QUALITY_ISSUE,
    reason: '',
  });

  const startDate = useMemo(() => {
    return dayjs().subtract(1, 'month').format('YYYY-MM-DD');
  }, []);
  const endDate = useMemo(() => {
    return dayjs().add(1, 'month').format('YYYY-MM-DD');
  }, []);

  // Data Fetching
  const { data: orders } = useQuery({
    queryKey: ['orders', companyId, selectedClient?.id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/clients/orders?userId=${selectedClient?.id}&startDate=${startDate}&endDate=${endDate}`,
        ),
      );
      return response.data.data;
    },
    enabled: !!selectedClient?.id,
  });

  const { data: categoryItems } = useQuery({
    queryKey: ['categoryItems', companyId, selectedClient?.categoryId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/clients/items?categoryId=${selectedClient?.categoryId}`,
        ),
      );
      return response.data.data;
    },
    enabled: !!selectedClient?.categoryId,
  });

  const { renderOrderSearch, selectedOrder } = useOrders(orders || []);

  const isQualifyToCreate = useMemo(() => {
    return (
      creditItems.length > 0 && creditItems.every((item: CreditItem | any) => item.categoryItem) &&
      selectedOrder &&
      selectedClient &&
      selectedCreditType &&
      formData.reportedDate
    );
  }, [creditItems, selectedOrder, selectedClient, formData]);

  const totalQuantity = useMemo(
    () =>
      selectedOrder?.items?.reduce(
        (acc: number, item: IItem) => acc + (item.quantity || 0),
        0,
      ),
    [selectedOrder],
  );

  const orderViewItems = useMemo(() => {
    return [...(selectedOrder?.items || []), ...creditItems];
  }, [selectedOrder, creditItems]);

  const orderDiscount = useMemo(
    () =>
      selectedOrder?.orderedItems?.reduce(
        (acc: number, item: IItem | any) =>
          acc +
          ((item?.option?.prevPrice || item.prevPrice) - item.price) *
            item.quantity,
        0,
      ),
    [selectedOrder],
  );

  const creditSummary = useMemo(() => {
    return {
      totalQuantity: creditItems.reduce(
        (acc: number, item: CreditItem | any) => acc + item.quantity,
        0,
      ),
      totalCreditAmount: creditItems.reduce(
        (acc: number, item: CreditItem | any) =>
          acc + item.price * item.quantity,
        0,
      ),
      totalLoss: creditItems.reduce((acc: number, item: CreditItem | any) => {
        return acc + item.priceDifference * item.quantity;
      }, 0),
    };
  }, [creditItems]);

  const handleAddCreditItem = () => {
    setCreditItems([
      ...creditItems,
      {
        id: Date.now().toString(),
        inventoryItemId: 0,
        orderedItemId: 0,
        actualPrice: 0,
        priceDifference: 0,
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const handleRemoveCreditItem = (id: string | number) => {
    setCreditItems(
      creditItems.filter((item: CreditItem | any) => item.id !== id),
    );
  };

  const handleCreateCreditReport = async () => {
    if (!isQualifyToCreate) {
      showNotification('error', 'Please fill all the required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/credit-reports'),
        {
          userId: selectedClient?.id,
          orderId: selectedOrder?.id,
          creditItems: creditItems,
          type: selectedCreditType,
          reason: formData.reason,
          reportedDate: formData.reportedDate,
          totalLoss: creditSummary.totalLoss,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      router.push(`/admin/${companyId}/credit-reports`);
    } catch (error: any) {
      console.log(error, 'Something went wrong');
      showNotification('error', 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTotal = () => {
    return (
      <Grid container spacing={1} mt={2}>
        <Grid item xs={12} mt={4} textAlign="center">
          <Typography fontWeight="bold" variant="h6" textAlign="center">
            TOTAL
          </Typography>
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Number of items</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">{totalQuantity} items</Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        {orderDiscount && orderDiscount > 0 ? (
          <>
            <Grid item xs={4} textAlign="left" ml={2}>
              <Typography>Discount ($)</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography fontWeight="bold">
                -${orderDiscount?.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        ) : null}
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Subtotal</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            $
            {selectedOrder?.subTotal?.toFixed(2) ||
              selectedOrder?.totalPrice?.toFixed(2) ||
              0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>GST (5%)</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${selectedOrder?.GST?.toFixed(2) || 0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>PST (7%)</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${selectedOrder?.PST?.toFixed(2) || 0}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={4} textAlign="left" ml={2}>
          <Typography>Total</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Typography fontWeight="bold">
            ${selectedOrder?.totalPrice?.toFixed(2)}
          </Typography>
        </Grid>
        {/* <Grid item xs={12}> */}
        {/* </Grid> */}
      </Grid>
    );
  };

  const renderOrderView = () => {
    return (
      <ShadowSection display="flex" flexDirection="column" gap={1}>
        {/* Only admin can affect inventory for an order in edit mode */}
        <Typography variant="h6" textAlign="center">
          {selectedClient?.clientName || 'N/A'}&apos; Order
        </Typography>

        {orderViewItems.length > 0 ? (
          orderViewItems.map((item: IItem | any) => {
            return (
              <Box
                key={item.id}
                display="flex"
                flexDirection="column"
                gap={1}
                sx={{
                  p: 1,
                  backgroundColor: primary.lightest,
                  borderRadius: 1,
                }}
              >
                <DisplayFile
                  fileKey={item?.image || item?.inventoryItem?.image}
                  width="100px"
                  height="100px"
                />
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  justifyContent="space-between"
                >
                  <Typography fontWeight="bold">{item.name}</Typography>
                </Box>
                {item?.option && (
                  <Typography sx={{ color: grey[700] }}>
                    {item.option.name}
                  </Typography>
                )}

                <Box
                  display="flex"
                  alignItems="flex-start"
                  // justifyContent="space-between"
                  flexDirection="column"
                  gap={2}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography>${item?.price?.toFixed(2) || 0.0}</Typography>
                    {(item?.option?.isShowDiscount || item.isShowDiscount) &&
                      (item?.option?.prevPrice > 0 || item.prevPrice > 0) && (
                        <Typography
                          // fontWeight="bold"
                          sx={{ textDecoration: 'line-through' }}
                          color="error"
                        >
                          $
                          {item?.option?.prevPrice?.toFixed(2) ||
                            item.prevPrice.toFixed(2)}
                        </Typography>
                      )}
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">
                        Qty: <strong>{item.quantity}</strong>
                      </Typography>
                    </Box>

                    <Typography variant="h6">
                      Total: $
                      {((item?.quantity || 1) * item?.price)?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        ) : (
          <ErrorComponent errorText="Your order is empty" />
        )}

        {renderTotal()}
      </ShadowSection>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Sidebar>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={4}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: alpha(neutral[200], 0.5),
                '&:hover': {
                  background: alpha(neutral[300], 0.7),
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${error.main} 0%, ${error.dark} 100%)`,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 6px -1px ${alpha(error.main, 0.25)}`,
              }}
            >
              <Receipt fontSize="large" />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Box>
                <Typography variant="h4" fontWeight="bold" color={error.dark}>
                  Create Credit Report
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create a new credit report for customer refunds
                </Typography>
              </Box>

              <LoadingButton
                loading={isSubmitting}
                onClick={handleCreateCreditReport}
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={!isQualifyToCreate}
              >
                Create
              </LoadingButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid
              item
              md={8}
              xs={12}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">Selected Client</Typography>
                {renderClientSearch()}
              </BorderSection>
              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                >
                  <Typography variant="subtitle1">Credit Items</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Add />}
                    disabled={!selectedOrder}
                    onClick={handleAddCreditItem}
                  >
                    Add Item
                  </Button>
                </Box>

                {creditItems.length > 0 ? (
                  <>
                    {creditItems.map((item: CreditItem | any) => {
                      return (
                        <Grid key={item.id} container spacing={2}>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Autocomplete
                              options={categoryItems || []}
                              getOptionLabel={(option: any) => option.name}
                              renderInput={(params) => (
                                <TextField {...params} label="Item" />
                              )}
                              value={item.categoryItem}
                              onChange={(e, newValue: any) => {
                                setCreditItems(
                                  creditItems.map(
                                    (creditItem: CreditItem | any) =>
                                      creditItem.id === item.id
                                        ? {
                                            ...creditItem,
                                            categoryItem: newValue,
                                            actualPrice: newValue.price,
                                            isShowDiscount: true,
                                            prevPrice: newValue.price,
                                            priceDifference: newValue.price,
                                            name: `${newValue.name} CREDIT`,
                                            inventoryItem:
                                              newValue.inventoryItem,
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
                                  creditItems.map(
                                    (creditItem: CreditItem | any) =>
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
                                  creditItems.map(
                                    (creditItem: CreditItem | any) =>
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
                    })}
                  </>
                ) : (
                  <ErrorComponent errorText="Add the items you want to credit" />
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">General Information</Typography>
                <Grid container spacing={2} mt={2}>
                  <Grid item xs={12} md={6}>
                    {renderCreditTypeSearch()}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Reported Date"
                        value={dayjs(formData.reportedDate)}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            reportedDate: value?.toISOString(),
                          })
                        }
                        sx={{ width: '100%' }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Reason"
                      fullWidth
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      multiline
                      rows={4}
                      placeholder="Please provide a detailed description of the credit report"
                    />
                  </Grid>
                </Grid>
              </BorderSection>

              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">Credit Summary</Typography>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography variant="subtitle2">Number of items</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {creditSummary.totalQuantity || 0} items
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2">
                    Total Credit Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${creditSummary.totalCreditAmount?.toFixed(2)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2">Total Loss</Typography>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: '1.5rem' }}
                    color="error"
                  >
                    ${creditSummary.totalLoss?.toFixed(2)}
                  </Typography>
                </Box>
              </BorderSection>
            </Grid>
            <Grid item md={4} xs={12}>
              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">Selected Order</Typography>
                {renderOrderSearch()}
                {selectedOrder && renderOrderView()}
              </BorderSection>
            </Grid>
          </Grid>

          {/* Notification Component */}
          {NotificationComp}
        </Box>
      </Sidebar>
    </LocalizationProvider>
  );
}
