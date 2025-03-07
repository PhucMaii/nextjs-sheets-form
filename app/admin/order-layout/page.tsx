'use client';
import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Appearance from '../components/Inventory/Appearance';
import { SWRFetchData } from '../../utils/db';
import { API_URL } from '../../utils/enum';
import { Box, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import useNotification from '@/hooks/useNotification';

export default function OrderLayoutPage() {

  const [itemTypes] = SWRFetchData(`${API_URL.ADMIN}/item-types`);

  const { showNotification, NotificationComp } = useNotification();

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Order Layout</Typography>
      </Box>

      <ShadowSection>
        <Appearance types={itemTypes?.data || []} showNotification={showNotification} />
      </ShadowSection>
    </Sidebar>
  );
}
