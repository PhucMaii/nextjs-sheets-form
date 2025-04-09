'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, TextField, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import PromotionTable from '../components/Tables/PromotionTable';
import AddPromotion from '../components/Modals/add/AddPromotion';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';

export default function Promotion() {
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const [promotions] = SWRFetchData(`${API_URL.ADMIN}/promotions`);

  return (
    <Sidebar>
      {NotificationComp}
      <AddPromotion
        open={isAddPromotionOpen}
        onClose={() => setIsAddPromotionOpen(false)}
        showNotification={showNotification}
      />
      <Typography variant="h5">Promotions</Typography>

      <ShadowSection>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            placeholder="Search promotion by title..."
            size="small"
          />

          <Button
            variant="contained"
            onClick={() => setIsAddPromotionOpen(true)}
            sx={{ flexShrink: 0 }}
          >
            + Create promotion
          </Button>
        </Box>

        <PromotionTable
          promotions={promotions?.data || []}
          showNotification={showNotification}
        />
      </ShadowSection>
    </Sidebar>
  );
}
