import { AlertColor, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import { Reorder } from 'framer-motion';
import { ScheduledOrder } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { ShadowSection } from '../../reports/styled';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  scheduledOrders: ScheduledOrder[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function ReArrangementModal({
  open,
  onClose,
  scheduledOrders,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderList, setOrderList] = useState<ScheduledOrder[]>(
    scheduledOrders || [],
  );

  useEffect(() => {
    if (scheduledOrders) {
      setOrderList(scheduledOrders);
    }
  }, [scheduledOrders]);

  const onSaveArrangement = async () => {
    try {
      setIsLoading(true);
      const newPositionIndexList = orderList.map(
        (scheduledOrder: ScheduledOrder, index: number) => {
          return {
            index,
            scheduledOrderId: scheduledOrder.id,
          };
        },
      );

      const removedPositionIndexIdList = orderList.map(
        (scheduledOrder: ScheduledOrder) => {
          return scheduledOrder.positionIndex.id;
        },
      );

      const response = await axios.put(
        getAdminApiUrl(companyId, '/scheduledOrders'),
        {
          removedPositionIndexIdList,
          newPositionIndexList,
          reArrangement: true,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Something went wrong. Please try again later: ' +
          error?.response?.data?.error || error,
      );
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal sx={{ maxHeight: '80vh', overflowY: 'scroll' }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Re Arrangement
        </Typography>
        {orderList.length > 0 ? (
          <Reorder.Group
            style={{ padding: 0 }}
            values={orderList}
            onReorder={setOrderList}
          >
            {orderList.map((scheduledOrder: ScheduledOrder) => {
              return (
                <Reorder.Item
                  value={scheduledOrder}
                  style={{ listStyle: 'none' }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 300,
                    mass: 1,
                  }}
                  key={scheduledOrder.id}
                >
                  <ShadowSection
                    display="flex"
                    alignItems="center"
                    gap={2}
                    p={2}
                  >
                    <Typography>
                      {scheduledOrder?.positionIndex?.index}.
                    </Typography>
                    <Typography>{scheduledOrder.user.clientName}</Typography>
                  </ShadowSection>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ) : (
          <ErrorComponent errorText="No Order Found" />
        )}

        <LoadingButton
          variant="contained"
          onClick={onSaveArrangement}
          loading={isLoading}
          fullWidth
        >
          Save Arrangement
        </LoadingButton>
      </BoxModal>
    </Modal>
  );
}
