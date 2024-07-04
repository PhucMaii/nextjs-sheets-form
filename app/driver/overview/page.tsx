'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import { Grid, Typography } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import OverviewCard from '@/app/admin/components/OverviewCard/OverviewCard';
import { blue } from '@mui/material/colors';
import { primaryColor } from '@/theme/color';
import useSWR from 'swr';
import { API_URL } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManifestTable from '@/app/admin/components/Tables/ManifestTable';

export default function OverviewPage() {
    const date = new Date();
    const today = YYYYMMDDFormat(date);
    const { data: orders } = useSWR(`${API_URL.DRIVER_ORDERS}?deliveryDate=${today}`);

  return (
    <Sidebar>
      <Typography variant="h5" fontWeight="bold">Good Morning, NGUYEN</Typography>
      <Typography variant="subtitle1">We wish you have a good day</Typography>
      <Grid container spacing={2} my={2}>
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
      <Typography variant="h6" fontWeight="bold">Manifest</Typography>
      {/* Manifest Table Here */}
      {orders?.data.manifest && <ManifestTable manifest={orders.data.manifest} />}
    </Sidebar>
  )
}
