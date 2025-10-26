'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ArrowBack, Receipt, Save } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { error, neutral } from '@/theme/color';
import { useParams, useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BorderSection } from '../../reports/styled';
import OrderSelection from '../../components/CreditReport/OrderSelection';
import ItemsAndGenInfo from '../../components/CreditReport/ItemsAndGenInfo';
import dayjs from 'dayjs';
import useSelectCreditType from '@/hooks/select/useSelectCreditType';
import { ICreditItem } from '@/app/utils/type';
import { CreditReport, CreditType } from '@prisma/client';
import CreditSummary from '../../components/CreditReport/CreditSummary';
import useNotification from '@/hooks/useNotification';
import CreditReportSkeleton from '../../components/CreditReport/CreditReportSkeleton';

export default function CreditReportPage() {
  const { companyId, id }: any = useParams();
  const router = useRouter();
  const { NotificationComp, showNotification } = useNotification();
  // Data Fetching
  const { data: creditReport, refetch: refetchCreditReport, isLoading: isLoadingCreditReport } = useQuery({
    queryKey: ['creditReport', companyId, id],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/credit-reports/${id}`),
      );
      return response.data.data;
    },
    enabled: !!companyId && !!id,
  });

  const { renderCreditTypeSearch, selectedCreditType, setSelectedCreditType } =
    useSelectCreditType();
  const { data: categoryItems, isLoading: isLoadingCategoryItems   } = useQuery({
    queryKey: ['categoryItems', companyId, creditReport?.user?.categoryId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/clients/items?categoryId=${creditReport?.user?.categoryId}`,
        ),
      );
      return response.data.data;
    },
    enabled: !!creditReport?.user?.categoryId,
  });

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const [creditItems, setCreditItems] = useState<ICreditItem[] | any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<CreditReport | any>({
    userId: 0,
    orderId: 0,
    reportedDate: dayjs().format('YYYY-MM-DD'),
    type: CreditType.QUALITY_ISSUE,
    reason: '',
  });

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
        const priceDifference = item.actualPrice - item?.price;
        return acc + priceDifference * item.quantity;
      }, 0),
    };
  }, [creditItems]);

  useEffect(() => {
    if (creditReport) {
      setFormData({
        userId: creditReport?.user?.id,
        orderId: creditReport?.order?.id,
        reportedDate: creditReport?.reportedDate,
        type: creditReport?.type,
        reason: creditReport?.reason,
      });
      setSelectedCreditType(creditReport?.type);
    }

    if (categoryItems) {
      const formattedCreditItems = creditReport?.creditItems?.map(
        (item: ICreditItem | any) => {
          const existedCategoryItem = categoryItems?.find(
            (categoryItem: any) =>
              categoryItem.inventoryItemId === item.inventoryItemId,
          );
          console.log(existedCategoryItem, 'existedCategoryItem');
          return {
            ...item,
            categoryItem: existedCategoryItem,
            price: item.orderedItem.price,
          };
        },
      );
      setCreditItems(formattedCreditItems || []);
    }
  }, [creditReport, categoryItems]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, `/credit-reports`),
        {
          id: creditReport?.id,
          creditType: selectedCreditType,
          reportedDate: formData.reportedDate,
          reason: formData.reason,
          creditItems: creditItems,
        },
      );
      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }
      showNotification('success', response.data.message);
      await refetchCreditReport();
      router.push(`/admin/${companyId}/credit-reports`);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCreditReport || isLoadingCategoryItems) {
    return (
      <Sidebar>
        {NotificationComp}
        <CreditReportSkeleton />
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      {NotificationComp}
      <Box sx={{ p: 3 }}>
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
                {creditReport?.user?.clientName}&apos;s Credit Report
              </Typography>
              <Typography variant="body1" color="text.secondary">
                #{creditReport?.id}
              </Typography>
            </Box>

            <LoadingButton
              loading={isLoading}
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
            >
              Save
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
              {/* {renderClientSearch()} */}
              <Typography variant="h6">
                {creditReport?.user?.clientName} -{' '}
                {creditReport?.user?.clientId}
              </Typography>
            </BorderSection>
            {mdDown && (
              <Grid item xs={12}>
                <OrderSelection
                  selectedClient={creditReport?.user}
                  creditItems={creditItems || []}
                  selectedOrder={creditReport?.order}
                  isDisabledSearch
                />
              </Grid>
            )}
            <BorderSection display="flex" flexDirection="column" gap={1}>
              <ItemsAndGenInfo
                selectedOrder={creditReport?.order}
                creditItems={creditItems || []}
                setCreditItems={setCreditItems}
                categoryItems={categoryItems || []}
                renderCreditTypeSearch={renderCreditTypeSearch}
                formData={formData}
                setFormData={setFormData}
                baseItems={creditReport?.creditItems || []}
                showNotification={showNotification}
                refetchCreditReport={refetchCreditReport}
              />
            </BorderSection>

            <BorderSection display="flex" flexDirection="column" gap={1}>
              <CreditSummary creditSummary={creditSummary} />
            </BorderSection>
          </Grid>
          {!mdDown && (
            <Grid item md={4}>
              <OrderSelection
                selectedClient={creditReport?.user}
                creditItems={creditItems || []}
                selectedOrder={creditReport?.order}
                isDisabledSearch
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Sidebar>
  );
}
