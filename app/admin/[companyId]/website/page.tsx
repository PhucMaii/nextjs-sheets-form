'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import WebsiteItems from '../components/Settings/WebsiteItems';
import { Tab, Tabs } from '@mui/material';
import WebsitePromotion from '../components/Settings/WebsitePromotion';

export default function Website() {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Sidebar>
      <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)} sx={{borderBottom: '1px solid #e0e0e0'}}>
        <Tab label="Items" />
        <Tab label="Promotions" />
      </Tabs>

      {tabIndex === 0 && <WebsiteItems />}
      {tabIndex === 1 && <WebsitePromotion />}
    </Sidebar>
  );
}
