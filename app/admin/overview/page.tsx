'use client';
import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import NotificationPopup from '../components/Notification'
import { Notification } from '@/app/utils/type'
import { Grid, Typography } from '@mui/material';
import SelectDateRange from '../components/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import OverviewData from '../components/OverviewData';
import { fetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import AreaChart from '../components/Charts/AreaChart';
import { ShadowSection } from '../reports/styled';
import PieChart from '../components/Charts/PieChart';

export default function Overview() {
    const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
    const [notification, setNotification] = useState<Notification>({
      on: false,
      type: 'info',
      message: '',
    });
    const [overviewData, setOverviewData] = useState<any>({});
    const [revenueData, setRevenueData] = useState<any>();

    useEffect(() => {
        if (dateRange) {
            fetchOverviewData();
        }
    }, [dateRange])

    const fetchOverviewData = async () => {
        try {
            const returnData = await fetchData(`${API_URL.ORDER}/overview?startDate=${dateRange[0]}&endDate=${dateRange[1]}`, setNotification);

            setOverviewData(returnData.overviewData);
            setRevenueData(returnData.reports);
        } catch (error: any) {
            console.log('There was an error: ', error);
            setNotification({
                on: true,
                type: 'error',
                message: error.response.data.error
            })
        }
    }

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Grid container columnSpacing={2} alignItems="center" rowGap={2}>
        <Grid item xs={12} textAlign="right">
          <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
        </Grid>
        <OverviewData overviewData={overviewData} />
        <Grid item md={8} xs={12}>
          {revenueData && (
            <ShadowSection sx={{height: 365}}>
                <Typography variant="h6">Revenue</Typography>
              <AreaChart
                timeSeries={revenueData.timeSeries}
                thisMonthData={revenueData.thisMonth}
                lastMonthData={revenueData.lastMonth}
              />
            </ShadowSection>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
            <ShadowSection
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                gap={2}
                sx={{height: 365}}
            >
                <PieChart overviewData={overviewData} />
                <Typography variant="h6">Paid vs Unpaid</Typography>
            </ShadowSection>
        </Grid>
      </Grid>
    </Sidebar>
  );
}
