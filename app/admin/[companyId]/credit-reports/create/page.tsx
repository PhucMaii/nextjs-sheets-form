'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Grid, IconButton, Fab, Divider, Button } from '@mui/material';
import { Add, ArrowBack, Receipt } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

// Import theme colors
import { error, neutral, primary } from '@/theme/color';

// Import existing components and utilities
import Sidebar from '../../components/Sidebar/Sidebar';
import useNotification from '@/hooks/useNotification';
import { getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { BorderSection, ShadowSection } from '../../reports/styled';
import useClients from '@/hooks/select/useClients';
import { CreditReport, CreditType, Orders } from '@prisma/client';
import useOrders from '@/hooks/select/useOrders';
import ErrorComponent from '../../components/ErrorComponent';
import { IItem } from '@/app/utils/type';
import DisplayFile from '../../components/Modals/DisplayFile';
import { grey } from '@mui/material/colors';

export default function CreateCreditReport() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { NotificationComp } = useNotification();
  const { renderClientSearch, selectedClient } = useClients(companyId);
  // State management
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
    return dayjs().format('YYYY-MM-DD');
  }, []);

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

  const { renderOrderSearch, selectedOrder } = useOrders(orders || []);
  const totalQuantity = useMemo(
    () =>
      selectedOrder?.orderedItems?.reduce(
        (acc: number, item: IItem) => acc + (item.quantity || 0),
        0,
      ),
    [selectedOrder],
  );

  const orderDiscount = useMemo(
    () =>
      selectedOrder?.orderedItems?.reduce(
        (acc: number, item: IItem | any) => acc + ((item?.option?.prevPrice || item.prevPrice) - item.price) * item.quantity,
        0,
      ),
    [selectedOrder],
  );

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
            ${selectedOrder?.subTotal?.toFixed(2) || selectedOrder?.totalPrice?.toFixed(2) || 0}
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
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        // sx={{
        //   position: 'sticky',
        //   top: 0,
        //   width: '100%',
        //   // mb: isModal && smDown ? 4 : 0,
        //   overflowY: 'auto',
        //   maxHeight: '100vh',
        // }}
        data-tour="fourth-step"
      >
        {/* Only admin can affect inventory for an order in edit mode */}
        <Typography variant="h6" textAlign="center">
          {selectedClient?.clientName || 'N/A'}&apos; Order
        </Typography>

        {selectedOrder && selectedOrder?.items && selectedOrder?.items.length > 0 ? (
          selectedOrder.items.map((item: IItem | any) => {
            // console.log('item', item);
            return (
              <Box
                key={item.id}
                display="flex"
                flexDirection="column"
                // justifyContent="space-between"
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
                    <Typography>${item.price.toFixed(2)}</Typography>
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
            <Box>
              <Typography variant="h4" fontWeight="bold" color={error.dark}>
                Create Credit Report
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create a new credit report for customer refunds
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item md={8} xs={12} display="flex" flexDirection="column" gap={1}>
              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">Selected Client</Typography>
                {renderClientSearch()}
              </BorderSection>
              <BorderSection display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography variant="subtitle1">Credit Items</Typography>
                  <Button variant="contained" color="primary" startIcon={<Add />}>
                    Add Item
                  </Button>
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
