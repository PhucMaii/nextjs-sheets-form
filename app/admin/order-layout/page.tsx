'use client';
import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Appearance from '../components/Appearance/Appearance';
import { SWRFetchData } from '../../utils/db';
import { Box, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import useNotification from '@/hooks/useNotification';

export default function OrderLayoutPage() {
  const [itemTypes] = SWRFetchData(`/api/appearance`);

  const { showNotification, NotificationComp } = useNotification();

  return (
    <Sidebar>
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Order Layout</Typography>
      </Box>

      <ShadowSection>

        <Box sx={{maxWidth: '450px', mx: 'auto'}}>
          <Appearance
            types={itemTypes?.data || []}
            showNotification={showNotification}
          />
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
