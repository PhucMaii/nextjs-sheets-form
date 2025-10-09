'use client';
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'
import { Tab, Tabs, Typography } from '@mui/material'
import { blueGrey } from '@mui/material/colors'
import Programs from '../components/Farm/Programs';
import ProgramSchedules from '../components/Farm/ProgramSchedules';

export default function Farm() {
  const [tab, setTab] = useState('programs');

  return (
    <Sidebar>
      <Typography variant="h5" color={blueGrey[800]}>
        Farm
      </Typography>
      <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Tab label="Programs" value="programs" />
        <Tab label="Schedules" value="schedules" />
      </Tabs>

      {tab === 'programs' && <Programs />}
      {tab === 'schedules' && <ProgramSchedules />}
    </Sidebar>
  )
}
