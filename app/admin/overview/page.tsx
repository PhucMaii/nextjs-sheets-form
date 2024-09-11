/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationPopup from '../components/Notification';
import { Notification } from '@/app/utils/type';
import { Box, Button, Grid, Skeleton, Switch, Typography } from '@mui/material';
import SelectDateRange from '../components/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import OverviewData from '../components/OverviewData';
import { API_URL } from '@/app/utils/enum';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import PieChart from '../components/Charts/PieChart';
import ManifestTable from '../components/Tables/ManifestTable';
import CustomersInDebt from '../components/Tables/CustomersInDebt';
import LoadingModal from '../components/Modals/LoadingModal';
import BSOverview from '../components/BSOverview';
import useLocalStorage from '@/hooks/useLocalStorage';
import { SWRFetchData } from '@/app/utils/db';
import DebtCustomers from '../components/Printing/DebtCustomers';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';

export default function Overview() {
  const [beansproutsData, setBeansproutsData] = useState<any>();
  const [customersInDebt, setCustomersInDebt] = useState<any>();
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [overviewData, setOverviewData] = useState<any>();
  const [revenueData, setRevenueData] = useState<any>();

  const [isMinify, setIsMinify] = useLocalStorage('isMinify', false);

  // Printing Ref
  const printDetbCustomersRef: any = useRef();

  // Data Fetching
  const [overview, _mutateOverview, isValidating] = SWRFetchData(
    `${API_URL.ORDER}/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    if (overview && dateRange) {
      // fetchOverviewData();
      initializeOverviewData();
    }
  }, [overview, dateRange]);

  // Handle loading
  useEffect(() => {
    if (!overview && isValidating) {
      setIsFetching(true);
    } else {
      setIsFetching(false);
    }
  }, [dateRange, overview]);

  const initializeOverviewData = () => {
    const overviewFetchedData = overview.data;
    setOverviewData(overviewFetchedData.overviewData);
    setRevenueData(overviewFetchedData.reports);
    setBeansproutsData(overviewFetchedData.beansprouts);
    setCustomersInDebt(overviewFetchedData.customersInDebt);
  };

  const handlePrintCustomersInDebt = useReactToPrint({
    content: () => printDetbCustomersRef.current,
  });

  return (
    <Sidebar>
      <div style={{ display: 'none' }}>
        <DebtCustomers
          debtCustomers={customersInDebt}
          ref={printDetbCustomersRef}
        />
      </div>
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
            type="P.P"
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
          <ManifestTable
            isMinify={isMinify}
            manifest={overviewData?.manifest || null}
            isAdmin
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight="bold" sx={{ my: 2 }}>
              Customers in debt
            </Typography>
            <Button onClick={handlePrintCustomersInDebt}>
              <Box display="flex" alignItems="center" gap={1}>
                <PrintIcon />
                <Typography>Print</Typography>
              </Box>
            </Button>
          </Box>
          <CustomersInDebt customersInDebt={customersInDebt} />
        </Grid>
      </Grid>
    </Sidebar>
  );
}
