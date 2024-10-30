'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Box, Tab, Tabs } from '@mui/material';
import { grey } from '@mui/material/colors';
import { ShadowSection } from '@/app/admin/reports/styled';
import PlaceOrder from '../components/PlaceOrder';
import useNotification from '@/hooks/useNotification';
import AddExpense from '../components/AddExpense';

export default function AddPage() {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const { showNotification, NotificationComp } = useNotification();

  return (
    <Sidebar>
      {NotificationComp}
      <ShadowSection>
        <Tabs
          variant="fullWidth"
          value={currentTab}
          onChange={(e, value) => setCurrentTab(value)}
          style={{ borderBottom: `1px solid ${grey[300]}` }}
        >
          <Tab value={0} aria-controls="tabpanel-0" label="Place Order" />
          <Tab value={1} aria-controls="tabpanel-1" label="Add Expense" />
        </Tabs>

        <Box mt={2} p={2}>
          {currentTab === 0 ? (
            <PlaceOrder showNotification={showNotification} />
          ) : (
            <AddExpense showNotification={showNotification} />
          )}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
