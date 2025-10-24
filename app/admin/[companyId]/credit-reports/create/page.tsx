'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, Receipt, Save } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';

// Import theme colors
import { error, neutral } from '@/theme/color';

// Import existing components and utilities
import Sidebar from '../../components/Sidebar/Sidebar';
import useNotification from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { BorderSection } from '../../reports/styled';
import useClients from '@/hooks/select/useClients';
import { CreditReport, CreditType } from '@prisma/client';
import useOrders from '@/hooks/select/useOrders';
import { ICreditItem } from '@/app/utils/type';
import useSelectCreditType from '@/hooks/select/useSelectCreditType';
import { LoadingButton } from '@mui/lab';
import OrderSelection from '../../components/CreditReport/OrderSelection';
import ItemsAndGenInfo from '../../components/CreditReport/ItemsAndGenInfo';

export default function CreateCreditReport() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { NotificationComp, showNotification } = useNotification();
  const { renderClientSearch, selectedClient } = useClients(companyId);
  const { renderCreditTypeSearch, selectedCreditType } = useSelectCreditType();

  // State management
  const [creditItems, setCreditItems] = useState<ICreditItem[] | any[]>([]);
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

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

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
      creditItems.length > 0 &&
      creditItems.every((item: ICreditItem | any) => item.categoryItem) &&
      selectedOrder &&
      selectedClient &&
      selectedCreditType &&
      formData.reportedDate
    );
  }, [creditItems, selectedOrder, selectedClient, formData]);

  const creditSummary = useMemo(() => {
    return {
      totalQuantity: creditItems.reduce(
        (acc: number, item: ICreditItem | any) => acc + item.quantity,
        0,
      ),
      totalCreditAmount: creditItems.reduce(
        (acc: number, item: ICreditItem | any) =>
          acc + item.price * item.quantity,
        0,
      ),
      totalLoss: creditItems.reduce((acc: number, item: ICreditItem | any) => {
        return acc + item.priceDifference * item.quantity;
      }, 0),
    };
  }, [creditItems]);

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

  return (
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
            {mdDown && (
              <Grid item xs={12}>
                <OrderSelection
                  selectedClient={selectedClient}
                  creditItems={creditItems as ICreditItem[]}
                  renderOrderSearch={renderOrderSearch}
                  selectedOrder={selectedOrder}
                />
              </Grid>
            )}
            {/* <BorderSection display="flex" flexDirection="column" gap={1}>
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
                  {creditItems.map((item: ICreditItem | any) => {
                    return (
                      <CreditItem
                        key={item.id}
                        item={item}
                        categoryItems={categoryItems || []}
                        creditItems={creditItems as ICreditItem[]}
                        setCreditItems={setCreditItems}
                      />
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
            </BorderSection> */}
            <ItemsAndGenInfo
              selectedOrder={selectedOrder}
              creditItems={creditItems as ICreditItem[]}
              setCreditItems={setCreditItems}
              categoryItems={categoryItems || []}
              renderCreditTypeSearch={renderCreditTypeSearch}
              formData={formData}
              setFormData={setFormData}
            />

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
                <Typography variant="subtitle2">Total Credit Amount</Typography>
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
          {!mdDown && (
            <Grid item md={4}>
              <OrderSelection
                selectedClient={selectedClient}
                creditItems={creditItems as ICreditItem[]}
                renderOrderSearch={renderOrderSearch}
                selectedOrder={selectedOrder}
              />
            </Grid>
          )}
        </Grid>

        {/* Notification Component */}
        {NotificationComp}
      </Box>
    </Sidebar>
  );
}
