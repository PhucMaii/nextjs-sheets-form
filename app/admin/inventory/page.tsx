'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Divider, Tab, Tabs, Typography } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { ShadowSection } from '../reports/styled';
import StockItems from '../components/Inventory/StockItems';
import OrderStock from '../components/Inventory/OrderStock';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import InventoryOverview from '../components/Overview/InventoryOverview';

export default function InventoryPage() {
  const [tabIndex, setTabIndex] = useState<number>(0);

  const { showNotification, NotificationComp } = useNotification();
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  return (
    <Sidebar>
      {NotificationComp}
      <Typography variant="h5" color={blueGrey[800]}>
        Inventory
      </Typography>
      <Divider sx={{ my: 2 }} />

      <InventoryOverview inventoryItems={inventoryItems?.data || []} />

      <Tabs
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        value={tabIndex}
        onChange={(e, index) => setTabIndex(index)}
      >
        <Tab label="Inventory" value={0} />
        <Tab label="Order Stock" value={1} />
      </Tabs>

      <ShadowSection>
        {tabIndex === 0 ? (
          <StockItems
            showNotification={showNotification}
            inventoryItems={inventoryItems}
          />
        ) : (
          <OrderStock />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
