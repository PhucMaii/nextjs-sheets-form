'use client';
import React, { useEffect, useState } from 'react';
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
import AddStockPurchased from '../components/Modals/add/AddStockPurchased';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import BSOrderPrompt from '../components/Modals/BSOrderPrompt';
import useLocalStorage from '@/hooks/useLocalStorage';
import { getTodayDate } from '@/pages/api/utils/date';

export default function InventoryPage() {
  const [isTrackingInventory, setIsTrackingInventory] =
    useState<boolean>(false);
  const [isOpenAddStockPurchased, setIsOpenAddStockPurchased] =
    useState<boolean>(false);
  const [isOpenOrderPrompt, setIsOpenOrderPrompt] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const currentDate = getTodayDate();
  const [hasPrompted, setHasPrompted] = useLocalStorage('hasPrompted', {hasPrompted: false, date: currentDate.date});
  const { showNotification, NotificationComp } = useNotification();
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  useEffect(() => {
    if (!hasPrompted.hasPrompted || hasPrompted.date !== currentDate.date) {
      console.log({hasPrompted: hasPrompted.hasPrompted, date: hasPrompted.date !== currentDate.date})
      setIsOpenOrderPrompt(true);
      setHasPrompted({hasPrompted: true, date: currentDate.date});
    } else {
      setIsOpenOrderPrompt(false);
    }
  }, []);

  const handleTrackInventory = async () => {
    try {
      setIsTrackingInventory(true);
      const response = await axios.post(`/api/track-inventory`);

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsTrackingInventory(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsTrackingInventory(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Internal Server Error: ' + error);
      setIsTrackingInventory(false);
    }
  };


  return (
    <Sidebar>
      <BSOrderPrompt open={isOpenOrderPrompt} onClose={() => setIsOpenOrderPrompt(false)} />
      <AddStockPurchased
        open={isOpenAddStockPurchased}
        onClose={() => setIsOpenAddStockPurchased(false)}
        showNotification={showNotification}
      />
      {NotificationComp}
      <Typography variant="h5" color={blueGrey[800]}>
        Inventory
      </Typography>
      <Divider sx={{ my: 2 }} />

      <InventoryOverview inventoryItems={inventoryItems?.data || []} />
      <LoadingButton
        loading={isTrackingInventory}
        onClick={handleTrackInventory}
      >
        Check Inventory Quantity
      </LoadingButton>
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
          <OrderStock
            openAddStockPurchased={() => setIsOpenAddStockPurchased(true)}
            showNotification={showNotification}
          />
        )}
      </ShadowSection>
    </Sidebar>
  );
}
