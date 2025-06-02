'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Tab,
  Tabs,
} from '@mui/material';
import ShiftSession from './ShiftSession';
import ScheduledShifts from './ScheduledShifts';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Payroll from './Payroll';

export default function ShiftPage() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const tabValue = useSearchParams()?.get('tab');

  const [tab, setTab] = useState<string>('shifts');

  useEffect(() => {
    if (tabValue === 'shifts') {
      setTab('shifts');
    } else if (tabValue === 'schedule') {
      setTab('schedule');
    } else if (tabValue === 'payroll') {
      setTab('payroll');
    }
  }, [tabValue]);

  return (
    <Sidebar>
      <Tabs sx={{ borderBottom: '1px solid #e0e0e0' }} value={tab} onChange={(e, value) => {
        router.push(`/admin/${companyId}/shifts?tab=${value}`);
      }}>
        <Tab label="Shifts" value="shifts" />  
        <Tab label="Schedule" value="schedule" />
        <Tab label="Payroll" value="payroll" />
        {/* <Tab label="Payroll" value="payroll" /> */}
      </Tabs>

      {tab === 'shifts' && (
        <ShiftSession />
      )}

      {tab === 'schedule' && (
        <ScheduledShifts />
      )}

      {tab === 'payroll' && (
        <Payroll />
      )}
    </Sidebar>
  );
}
