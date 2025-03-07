'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Divider, IconButton, Tab, Tabs, Typography } from '@mui/material';
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
import { FileClockIcon } from 'lucide-react';
import TrackInventoryRecord from '../components/Modals/TrackInventoryRecord';
import ConfirmModal from '../components/Modals/ConfirmModal';
// import Appearance from '../components/Inventory/Appearance';

export default function InventoryPage() {
  const [isTrackingInventory, setIsTrackingInventory] =
    useState<boolean>(false);
  const [isOpenAddStockPurchased, setIsOpenAddStockPurchased] =
    useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  // const [isOpenOrderPrompt, setIsOpenOrderPrompt] = useState<boolean>(false);
  const [isOpenTrackInventoryRecord, setIsOpenTrackInventoryRecord] =
    useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState<number>(0);

  const { showNotification, NotificationComp } = useNotification();
  const [inventoryItems] = SWRFetchData(`${API_URL.ADMIN}/inventory`);

  const handleTrackInventory = async () => {
    try {
      setIsTrackingInventory(true);
      const response = await axios.post(`/api/cron/track-inventory`);

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
    <Sidebar overflow="auto">
      <AddStockPurchased
        open={isOpenAddStockPurchased}
        onClose={() => setIsOpenAddStockPurchased(false)}
        showNotification={showNotification}
      />
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        showNotification={showNotification}
        title="Are you sure to check inventory quantity?"
        handleSubmit={handleTrackInventory}
        buttonLabel="Check"
      />
      <TrackInventoryRecord
        open={isOpenTrackInventoryRecord}
        onClose={() => setIsOpenTrackInventoryRecord(false)}
      />
      {NotificationComp}
      <Typography variant="h5" color={blueGrey[800]}>
        Inventory
      </Typography>
      <Divider sx={{ my: 2 }} />

      <InventoryOverview inventoryItems={inventoryItems?.data || []} />
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        my={2}
        gap={1}
      >
        <LoadingButton
          loading={isTrackingInventory}
          onClick={() => setIsOpenConfirmModal(true)}
          variant="contained"
        >
          Check Inventory Quantity
        </LoadingButton>
        <IconButton
          color="primary"
          onClick={() => setIsOpenTrackInventoryRecord(true)}
        >
          <FileClockIcon />
        </IconButton>
      </Box>
      <Tabs
        sx={{ borderBottom: 1, borderColor: 'divider' }}
        value={tabIndex}
        onChange={(e, index) => setTabIndex(index)}
      >
        <Tab label="Inventory" value={0} />
        <Tab label="Order Stock" value={1} />
      </Tabs>

      <ShadowSection sx={{ overflow: 'scroll', width: '100%' }}>
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
          // <Appearance types={inventoryItems?.types || []}/>
        )}
      </ShadowSection>
    </Sidebar>
  );
}
