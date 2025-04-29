/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Switch,
  Typography,
} from '@mui/material';
import SelectDateRange from '../components/Select/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import { API_URL } from '@/app/utils/enum';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import PieChart from '../components/Charts/PieChart';
import ManifestTable from '../components/Tables/ManifestTable';
import CustomersInDebt from '../components/Tables/CustomersInDebt';
import LoadingModal from '../components/Modals/LoadingModal';
import useLocalStorage from '@/hooks/useLocalStorage';
import { SWRFetchData } from '@/app/utils/db';
import DebtCustomers from '../components/Printing/DebtCustomers';
import { useReactToPrint } from 'react-to-print';
import PrintIcon from '@mui/icons-material/Print';
import useNotification from '@/hooks/useNotification';
import OverviewData from '../components/Overview/OverviewData';
import CustomersProfitTable from '../components/Tables/CustomersProfitTable';
import StatusText from '../components/StatusText';
import DriverTablesReport from '../components/Tables/DriverTablesReport';
import TopDrivers from '../components/Tables/TopDrivers';

export default function Overview() {
  const [beansproutsData, setBeansproutsData] = useState<any>();
  const [customersInDebt, setCustomersInDebt] = useState<any>();
  const [customersProfit, setCustomersProfit] = useState<any>();
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [overviewData, setOverviewData] = useState<any>();
  const [revenueData, setRevenueData] = useState<any>();

  const [isMinify, setIsMinify] = useLocalStorage('isMinify', false);
  const { NotificationComp } = useNotification();

  // Printing Ref
  const printDetbCustomersRef: any = useRef();

  // Data Fetching
  const [overview, _mutateOverview, isValidating] = SWRFetchData(
    `${API_URL.ORDER}/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );
  const [shiftOverview] = SWRFetchData(
    `${API_URL.ADMIN}/shifts/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
  );

  useEffect(() => {
    if (overview && dateRange) {
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
    setCustomersProfit(overviewFetchedData.customersProfit);
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
      {NotificationComp}
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
        <Grid item xs={12} md={3}>
          {shiftOverview ? (
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ height: '500px !important' }}
            >
              <ShadowSection
                display="flex"
                flexDirection="column"
                gap={2}
                sx={{ height: '150px !important' }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap={'wrap'}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {shiftOverview?.totalHours?.toFixed(2)}h
                    </Typography>
                    <Typography variant="body1" fontWeight="regular">
                      Hours
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={2}>
                      <StatusText
                        text={`${shiftOverview?.unpaidShifts?.length}h`}
                        type="error"
                      />
                      <StatusText
                        text={`${shiftOverview?.paidShifts?.length}h`}
                        type="success"
                      />
                    </Box>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      ${shiftOverview?.totalCosts?.toFixed(2)}
                    </Typography>
                    <Typography variant="body1" fontWeight="regular">
                      Employee Costs
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mt={2}>
                      <StatusText
                        text={`$${shiftOverview?.unpaidShiftCost?.toFixed(2)}`}
                        type="error"
                      />
                      <StatusText
                        text={`$${shiftOverview?.paidShiftCost?.toFixed(2)}`}
                        type="success"
                      />
                    </Box>
                  </Box>
                </Box>
              </ShadowSection>

              <ShadowSection
                display="flex"
                flexDirection="column"
                gap={2}
                sx={{ height: '350px !important' }}
              >
                <TopDrivers
                  data={shiftOverview?.sortedDriverWithDriverHours}
                  limit={5}
                />
              </ShadowSection>
            </Box>
          ) : (
            <Skeleton
              variant="rounded"
              sx={{ width: '100% !important', height: '390px !important' }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={9}>
          {shiftOverview ? (
            <ShadowSection
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ height: '500px !important' }}
            >
              <Typography variant="h6">Drivers Reports</Typography>
              <DriverTablesReport data={shiftOverview.driverReports} />
            </ShadowSection>
          ) : (
            <Skeleton
              variant="rounded"
              sx={{ width: '100% !important', height: '390px !important' }}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" my={2}>
            <Typography variant="h5" fontWeight="bold">
              Customer's Profit
            </Typography>
            <Typography variant="subtitle2">
              Calculate based on all orders in selected date range
            </Typography>
          </Box>
          <CustomersProfitTable customersProfit={customersProfit} />
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
