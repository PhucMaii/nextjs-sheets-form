'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Tab, Tabs } from '@mui/material';
import HistoryShifts from './HistoryShifts';
import UpcomingShifts from './UpcomingShifts';

export default function ShiftPage() {
  const [tab, setTab] = useState<string>('upcoming');

  return (
    <Sidebar>

      <Tabs
        value={tab}
        onChange={(e, value) => setTab(value)}
        variant="fullWidth"
        sx={{ borderBottom: '1px solid #e0e0e0' }}
      >
        <Tab label="Upcoming" value="upcoming" />
        <Tab label="History" value="history" />
      </Tabs>
      
      {
        tab === 'upcoming' ? <UpcomingShifts /> : <HistoryShifts />
      }
    </Sidebar>
  );
}
