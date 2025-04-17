'use client';

import { ShadowSection } from '@/app/admin/reports/styled';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import Sidebar from '@/app/admin/components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ReceiveInventoryTable from '@/app/admin/components/Tables/ReceiveInventoryTable';

export const ReceivedProgress = ({
  receivedQty,
  rejectedQty,
  orderedQty,
}: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 10,
        borderRadius: 1,
        overflow: 'hidden',
        backgroundColor: '#e0e0e0', // fallback background for unfilled part
      }}
    >
      {/* Received portion */}
      <Box
        sx={{
          width: `${(receivedQty / orderedQty) * 100}%`,
          backgroundColor: '#4caf50', // green for received
          transition: 'width 0.3s ease',
        }}
      />

      {/* Rejected portion */}
      <Box
        sx={{
          width: `${(rejectedQty / orderedQty) * 100}%`,
          backgroundColor: '#f44336', // red for rejected
          transition: 'width 0.3s ease',
        }}
      />
    </Box>
  );
};

export default function ReceiveInventory() {
  const { id }: any = useParams();
  const router = useRouter();

  const [poNumber, setPoNumber] = useState<string>('');
  const [poItems, setPoItems] = useState<any[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  const receivedSummary = useMemo(() => {
    if (!poItems || poItems.length === 0) {
      return { orderedQty: 0, receivedQty: 0, rejectedQty: 0 };
    }

    const orderedQty = poItems.reduce((acc, item) => acc + item.orderedQty, 0);
    const receivedQty = poItems.reduce(
      (acc, item) => acc + (item?.receivedQty || 0),
      0,
    );
    const rejectedQty = poItems.reduce(
      (acc, item) => acc + (item?.rejectedQty || 0),
      0,
    );

    return {
      orderedQty,
      receivedQty,
      rejectedQty,
    };
  }, [poItems]);

  useEffect(() => {
    fetchPoItems();
  }, []);

  const fetchPoItems = async () => {
    try {
      const res = await axios.get(`${API_URL.ADMIN}/purchase-orders?id=${id}`);

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      setPoNumber(res.data.data.poNumber);
      setPoItems(res.data.data.poItems);
    } catch (error) {
      console.error(error);
    }
  };

  const onAcceptAll = () => {
    setPoItems((prev: any) =>
      prev.map((i: any) => ({ ...i, receivedQty: i.orderedQty })),
    );
  };

  const onRejectAll = () => {
    setPoItems((prev: any) =>
      prev.map((i: any) => ({ ...i, rejectedQty: i.orderedQty })),
    );
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Box
        sx={{
          width: '90%',
          maxWidth: 1920,
          mx: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1} my={2}>
            <IconButton onClick={() => router.push('/admin/purchase-orders')}>
              <ArrowBackIcon />
            </IconButton>

            <Box>
              <Typography variant="h5">Receive Inventory</Typography>
              <Typography variant="body2">#{poNumber}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} my={2}>
            <Button variant="contained" color="primary">
              Receive
            </Button>
          </Box>
        </Box>

        {poItems?.length > 0 ? (
          <ShadowSection>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Products</Typography>

              <Box display="flex" gap={1} alignItems="center">
                <Button onClick={onAcceptAll}>Accept All</Button>
                <Button onClick={onRejectAll}>Reject All</Button>
              </Box>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              alignItems="flex-end"
              my={2}
            >
              <ReceivedProgress
                receivedQty={receivedSummary.receivedQty}
                rejectedQty={receivedSummary.rejectedQty}
                orderedQty={receivedSummary.orderedQty}
              />
              <Typography variant="body2">
                {receivedSummary.receivedQty + receivedSummary.rejectedQty} of{' '}
                {receivedSummary.orderedQty}
              </Typography>
            </Box>

            <ReceiveInventoryTable poItems={poItems} setPoItems={setPoItems} />
          </ShadowSection>
        ) : (
          <LoadingComponent />
        )}
      </Box>
    </Sidebar>
  );
}
