'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, TextField, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import PromotionTable from '../components/Tables/PromotionTable';
import AddPromotion from '../components/Modals/add/AddPromotion';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import { useParams } from 'next/navigation';

export default function PromotionsPage() {
  const { companyId }: any = useParams();
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState<boolean>(false);
  const { showNotification, NotificationComp } = useNotification();

  const [promotions] = SWRFetchData(getAdminApiUrl(companyId, '/promotions'));

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
