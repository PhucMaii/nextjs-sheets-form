'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationPopup from '../components/Notification';
import { Notification } from '@/app/utils/type';
import {
  Box,
  Grid,
  Skeleton,
  Switch,
  Typography,
} from '@mui/material';
import SelectDateRange from '../components/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import OverviewData from '../components/OverviewData';
import { fetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import PieChart from '../components/Charts/PieChart';
import ManifestTable from '../components/Tables/ManifestTable';
import CustomersInDebt from '../components/Tables/CustomersInDebt';
import LoadingModal from '../components/Modals/LoadingModal';
import BSOverview from '../components/BSOverview';

export default function Overview() {
  const [beansproutsData, setBeansproutsData] = useState<any>();
  const [customersInDebt, setCustomersInDebt] = useState<any>();
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isMinify, setIsMinify] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [overviewData, setOverviewData] = useState<any>();
  const [revenueData, setRevenueData] = useState<any>();

  useEffect(() => {
    if (dateRange) {
      fetchOverviewData();
    }
  }, [dateRange]);

  const fetchOverviewData = async () => {
    try {
      setIsFetching(true);
      const returnData = await fetchData(
        `${API_URL.ORDER}/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
        setNotification,
      );

      setOverviewData(returnData.overviewData);
      setRevenueData(returnData.reports);
      setBeansproutsData(returnData.beansprouts);
      setCustomersInDebt(returnData.customersInDebt);
      setIsFetching(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsFetching(false);
    }
  };

  return (
    <Sidebar>
      <LoadingModal open={isFetching} />
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Grid container columnSpacing={2} alignItems="center" rowGap={2}>
        <Grid item xs={12} textAlign="right">
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Grid>
        <Grid item xs={12} textAlign="right">
          <Box
            display="flex"
            gap={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            <Switch
              checked={isMinify}
              onChange={(e) => setIsMinify(e.target.checked)}
            />
            <Typography variant="subtitle1">Minify</Typography>
          </Box>
        </Grid>
        <OverviewData isMinify={isMinify} overviewData={overviewData} />
        <Grid item md={8} xs={12}>
          {revenueData ? (
            <ShadowSection sx={{ height: 365 }}>
              <Typography variant="h6">Revenue</Typography>
              <AreaChart
                timeSeries={revenueData.timeSeries}
                thisMonthData={revenueData.thisMonth}
                lastMonthData={revenueData.lastMonth}
              />
            </ShadowSection>
          ) : (
            <Skeleton
              variant="rounded"
              sx={{ width: '100% !important', height: '390px !important' }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {overviewData ? (
            <ShadowSection
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap={2}
              sx={{ height: 365 }}
            >
              <PieChart overviewData={overviewData} />
              <Typography variant="h6">Paid vs Unpaid</Typography>
            </ShadowSection>
          ) : (
            <Skeleton
              variant="rounded"
              sx={{ width: '100% !important', height: '390px !important' }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <BSOverview
            type="B.K"
            beansproutsData={beansproutsData?.BK || null}
            isMinify={isMinify}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <BSOverview
            type="B.K"
            beansproutsData={beansproutsData?.PP || null}
            isMinify={isMinify}
          />
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" my={2}>
            <Typography variant="h5" fontWeight="bold">
              Manifest
            </Typography>
            <Typography variant="subtitle2">Delivered Items</Typography>
          </Box>
          <ManifestTable manifest={overviewData?.manifest || null} />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" fontWeight="bold" sx={{ my: 2 }}>
            Customers in debt
          </Typography>
          <CustomersInDebt customersInDebt={customersInDebt} />
        </Grid>
      </Grid>
    </Sidebar>
  );
}
