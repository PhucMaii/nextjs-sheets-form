import {
  AlertColor,
  Box,
  Divider,
  FormControl,
  LinearProgress,
  Modal,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Order } from '../../../orders/page';
import { ScheduledOrder } from '@/app/utils/type';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateCurrentTime,
  generateRecommendDate,
} from '@/app/utils/time';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LoadingButton } from '@mui/lab';
import { pusherClient } from '@/app/pusher';
// import { checkIsPreOrderQualified } from '@/app/utils/orders';

interface PropTypes extends ModalProps {
  order?: Order;
  showNotification: (type: AlertColor, message: string) => void;
  isPreOrder?: boolean;
  scheduleOrderList?: ScheduledOrder[];
  // progress?: number;
  mutateOrders?: any;
}

export default function EditDeliveryDate({
  open,
  onClose,
  order,
  showNotification,
  isPreOrder,
  scheduleOrderList,
  // progress,
  mutateOrders,
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);

  const [updatedDate, setUpdatedDate] = useState<string>(() => {
    if (order) {
      return order.deliveryDate;
    }

    const deliveryDate = generateRecommendDate();
    return deliveryDate;
  });

  useEffect(() => {
    pusherClient?.subscribe('admin-schedule-order');

    const handleReceiveOrder = (incomingOrder: Order) => {
      const sameIdOrder = createdOrders.some(
        (order: Order) => order.id === incomingOrder.id,
      );

      if (!sameIdOrder) {
        setCreatedOrders((prevOrders) => [...prevOrders, incomingOrder]);
      }
    };
    pusherClient?.bind('pre-order', handleReceiveOrder);

    return () => {
      pusherClient?.unsubscribe('admin-schedule-order');
    };
  }, []);

  useEffect(() => {
    if (scheduleOrderList && scheduleOrderList.length > 0) {
      // Filter out item has same id
      const filteredOrderLength = createdOrders.reduce(
        (accumulator: any, currentOrder: Order) => {
          const foundItem = accumulator.find((order: Order) => {
            return order?.id === currentOrder.id;
          });

          if (!foundItem) {
            accumulator = accumulator.concat(currentOrder);
          }

          return accumulator;
        },
        [],
      );
      setProgress(
        (filteredOrderLength.length / scheduleOrderList.length) * 100,
      );
    }
  }, [createdOrders]);

  useEffect(() => {
    setProgress(0);
  }, [scheduleOrderList]);

  const handlePreOrder = async () => {
    if (!scheduleOrderList) {
      return;
    }

    setIsLoading(true);
    try {
      const createdAt = generateCurrentTime();
      const submittedData: any = { deliveryDate: updatedDate, createdAt };

      // const qualifiedOrderToBePlaced = scheduleOrderList?.filter((order) => {
      //   const isQualified = checkIsPreOrderQualified(order);

      //   return isQualified;
      // });

      if (scheduleOrderList) {
        submittedData.scheduleOrderIds = scheduleOrderList.map((order) => {
          return order.id;
        });
      }
      // let orderIndex = 0;
      // const batchOrders = 5;
      // while (orderIndex < scheduleOrderList.length) {
      //   const toCreateOrders = scheduleOrderList.slice(
      //     orderIndex,
      //     orderIndex + batchOrders,
      //   );

      //   submittedData.scheduleOrderIds = toCreateOrders.map((order: any) => {
      //     return order.id;
      //   });

      //   // console.log(toCreateOrders, 'toCreateOrders');

      //   orderIndex += batchOrders;
      //   setProgress((orderIndex + 1 / scheduleOrderList.length) * 100);
      // }

      const response = await axios.post(API_URL.ORDER, submittedData);
      if (response.data.error) {
        setIsLoading(false);
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to update date: ', error);
      setIsLoading(false);
      showNotification('error', 'Fail to update date: ' + error);
    }
  };

  const handleUpdateDate = async () => {
    if (!order || !mutateOrders) {
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.put(API_URL.ORDER, {
        orderId: order.id,
        deliveryDate: updatedDate,
      });

      if (response.data.error) {
        setIsLoading(false);
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      mutateOrders();
      setIsLoading(false);
      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Fail to update date: ', error);
      setIsLoading(false);
      showNotification('error', 'Fail to update date: ' + error);
    }
  };

  const handleDateChange = (e: any) => {
    const formattedDate: string = formatDateChanged(e);
    setUpdatedDate(formattedDate);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={4}
        >
          <Typography variant="h4">
            {isPreOrder ? 'Pre Order' : 'Edit Delivery Date'}
          </Typography>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            onClick={() => {
              if (isPreOrder) {
                handlePreOrder();
              } else {
                handleUpdateDate();
              }
            }}
          >
            {isPreOrder ? 'Order' : 'Save'}
          </LoadingButton>
        </Box>
        <Divider />
        <Box display="flex" flexDirection="column" gap={1}>
          <FormControl fullWidth>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Edit Date"
                value={dayjs(updatedDate)}
                onChange={(e: any) => handleDateChange(e)}
                sx={{
                  width: '100%',
                  height: '0.1%',
                  borderRadius: 2,
                }}
                shouldDisableDate={disableChristmasAndNewYear}
              />
            </LocalizationProvider>
          </FormControl>
          {scheduleOrderList ? (
            <LinearProgress variant="determinate" value={progress} />
          ) : (
            ''
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
