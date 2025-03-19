'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { Box, Button, TextField, Typography } from '@mui/material';
import { ShadowSection } from '../reports/styled';
import PromotionTable from '../components/Tables/PromotionTable';
import AddPromotion from '../components/Modals/add/AddPromotion';

export default function Promotion() {
  const [isAddPromotionOpen, setIsAddPromotionOpen] = useState<boolean>(false);

  return (
    <Sidebar>
      <AddPromotion
        open={isAddPromotionOpen}
        onClose={() => setIsAddPromotionOpen(false)}
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

        <PromotionTable />
      </ShadowSection>
    </Sidebar>
  );
}
