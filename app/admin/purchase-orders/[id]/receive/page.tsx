'use client';

import { ShadowSection } from '@/app/admin/reports/styled';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import Sidebar from '@/app/admin/components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL, PO_STATUS } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ReceiveInventoryTable from '@/app/admin/components/Tables/ReceiveInventoryTable';
import { IPurchaseOrder } from '@/app/utils/type';
import ConvertToTransaction from '@/app/admin/components/Modals/add/ConvertToTransaction';
import { LoadingButton } from '@mui/lab';
import ReceivedProgress from '@/app/admin/components/ReceivedProgress';

export default function ReceiveInventory() {
  const { id }: any = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [po, setPo] = useState<IPurchaseOrder>({} as IPurchaseOrder);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [openConvertToTransactionModal, setOpenConvertToTransactionModal] =
    useState(false);
  const { showNotification, NotificationComp } = useNotification();

  const receivedSummary: any = useMemo(() => {
    if (!poItems || poItems.length === 0) {
      return {
        orderedQty: receivedSummary?.orderedQty || 0,
        receivedQty: receivedSummary?.receivedQty || 0,
        rejectedQty: receivedSummary?.rejectedQty || 0,
      };
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

      setPo(res.data.data);
      setPoItems([...res.data.data.poItems]);
      setIsLoading(false);
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

  const onReset = () => {
    setPoItems((prev: any) =>
      prev.map((i: any) => ({ ...i, receivedQty: 0, rejectedQty: 0 })),
    );
  };

  const handleSaveReceive = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post(
        `${API_URL.ADMIN}/purchase-orders/save-receive`,
        {
          poId: po?.id,
          poItems: poItems,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      router.push(`/admin/purchase-orders/${id}`);
    } catch (error) {
      console.error(error);
      showNotification('error', 'Error saving receive');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sidebar>
      {po && (
        <ConvertToTransaction
          open={openConvertToTransactionModal}
          onClose={() => setOpenConvertToTransactionModal(false)}
          showNotification={showNotification}
          po={{ ...po, poItems }}
        />
      )}
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
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>

            <Box>
              <Typography variant="h5">Receive Inventory</Typography>
              <Typography variant="body2">#{po.poNumber}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1} my={2}>
            <LoadingButton
              loading={isSaving}
              variant="contained"
              color="primary"
              onClick={() => {
                if (po?.status === PO_STATUS.RECEIVED) {
                  handleSaveReceive();
                } else {
                  setOpenConvertToTransactionModal(true);
                }
              }}
            >
              {po?.status === PO_STATUS.RECEIVED ? 'Save' : 'Receive'}
            </LoadingButton>
          </Box>
        </Box>

        {!isLoading && poItems?.length > 0 ? (
          <ShadowSection>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">Products</Typography>

              <Box display="flex" gap={1} alignItems="center">
                <Button onClick={onReset}>Reset</Button>
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
