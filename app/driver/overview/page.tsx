'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import { Box, Grid, Skeleton, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import OverviewCard from '@/app/admin/components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import { primaryColor } from '@/theme/color';
import useSWR from 'swr';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManifestTable from '@/app/admin/components/Tables/ManifestTable';
import LoadingModal from '@/app/admin/components/Modals/LoadingModal';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import StatusText from '@/app/admin/components/StatusText';

export default function OverviewPage() {
  const date = new Date();
  const today = YYYYMMDDFormat(date);
  const { data: orders, isValidating } = useSWR(
    `${API_URL.DRIVER_ORDERS}?deliveryDate=${today}`,
  );

  return (
    <Sidebar>
      <LoadingModal open={isValidating} />
      <Typography variant="h5" fontWeight="bold">
        Welcome back, {orders?.data.driver.name || ''}
      </Typography>
      <Typography variant="subtitle1">We wish you have a good day</Typography>
      <Grid container spacing={2} my={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Today's overview</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <OverviewCard
            backgroundColor={primaryColor}
            iconBackground={blue[50]}
            textColor="white"
            icon={<ReceiptLongIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="Total Orders"
            value={orders?.data.deliveryOrders.length || 0}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OverviewCard
            backgroundColor={primaryColor}
            iconBackground={blue[50]}
            textColor="white"
            icon={<AttachMoneyIcon sx={{ color: blue[700], fontSize: 50 }} />}
            text="COD Amount"
            value={orders?.data.codAmount || 0}
          />
        </Grid>
      </Grid>
      {isValidating ? (
        <Skeleton
          variant="rounded"
          sx={{ width: '100% !important', height: '390px !important' }}
        />
      ) : orders?.data.deliveryOrders.length > 0 ? (
        <>
          <Typography variant="h6" fontWeight="bold">
            Manifest
          </Typography>
          {orders?.data.manifest && (
            <ManifestTable manifest={orders.data.manifest} />
          )}
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          mt={6}
        >
          <EventAvailableIcon color="success" sx={{ fontSize: 100 }} />
          <StatusText
            text={'There is no orders waiting for you today.'}
            type="success"
          />
        </Box>
      )}
    </Sidebar>
  );
}
