'use client';

import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import Sidebar from '@/app/admin/[companyId]/components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PO_STATUS, getAdminApiUrl } from '@/app/utils/enum';
import useNotification from '@/hooks/useNotification';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ReceiveInventoryTable from '@/app/admin/[companyId]/components/Tables/ReceiveInventoryTable';
import { IPurchaseOrder } from '@/app/utils/type';
import ConvertToTransaction from '@/app/admin/[companyId]/components/Modals/add/ConvertToTransaction';
import { LoadingButton } from '@mui/lab';
import ReceivedProgress from '@/app/admin/[companyId]/components/ReceivedProgress';
import ConfirmStockInModal from '@/app/admin/[companyId]/components/Modals/ConfirmStockInModal';

export default function ReceiveInventory() {
  const { id, companyId }: any = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [po, setPo] = useState<IPurchaseOrder>({} as IPurchaseOrder);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [openConvertToTransactionModal, setOpenConvertToTransactionModal] =
    useState(false);
  const [openConfirmStockInModal, setOpenConfirmStockInModal] = useState(false);
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

  console.log(poItems, 'PO ITEMS');

  const fetchPoItems = async () => {
    console.log('Running fetchPoItems');
    try {
      const res = await axios.get(
        getAdminApiUrl(id, `/purchase-orders?id=${id}`),
      );

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
        getAdminApiUrl(id, '/purchase-orders/save-receive'),
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
      router.push(`/admin/${companyId}/purchase-orders/${id}`);
    } catch (error) {
      console.error(error);
      showNotification('error', 'Error saving receive');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPreApprove = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/purchase-orders/pre-approve'),
        {
          id: po.id,
          poItems: poItems,
        },
      )

      if (response.data.error) {
        showNotification('error', response.data.error)
        setIsSaving(false)
        return
      }

      showNotification('success', response.data.message || 'Purchase order pre approved')
      setOpenConfirmStockInModal(false)
      router.push(`/admin/${companyId}/purchase-orders/${id}`)
    } catch (error: any) {
      console.error('Error pre approving: ', error)
      showNotification(
        'error',
        error?.response?.data?.error || 'Error pre approving',
      )
      setIsSaving(false)
    }
  }

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
      <ConfirmStockInModal
        open={openConfirmStockInModal}
        onClose={() => setOpenConfirmStockInModal(false)}
        poItems={poItems}
        onConfirm={handleConfirmPreApprove}
        showNotification={showNotification}
        isLoading={isSaving}
      />
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
            {po?.status !== PO_STATUS.RECEIVED &&
              po?.status !== PO_STATUS.PRE_APPROVED && (
                <LoadingButton
                  loading={isSaving}
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenConfirmStockInModal(true)}
                >
                  Pre Approve
                </LoadingButton>
              )}
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
