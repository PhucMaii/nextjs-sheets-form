'use client';
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import NotificationPopup from '../components/Notification'
import { Notification } from '@/app/utils/type'
import { Grid } from '@mui/material';
import SelectDateRange from '../components/SelectDateRange';
import { generateMonthRange } from '@/app/utils/time';
import OverviewData from '../components/OverviewData';

export default function Overview() {
    const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
    const [notification, setNotification] = useState<Notification>({
        on: false,
        type: 'info',
        message: ''
    });

  return (
    <Sidebar>
        <NotificationPopup 
            notification={notification}
            onClose={() => setNotification({...notification, on: false})}
        />
        <Grid container columnSpacing={2} alignItems="center" rowGap={2}>
            <Grid item xs={12} textAlign="right">
                <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
            </Grid>
            <OverviewData dateRange={dateRange} setNotification={setNotification} />
        </Grid>
    </Sidebar>
  )
}
