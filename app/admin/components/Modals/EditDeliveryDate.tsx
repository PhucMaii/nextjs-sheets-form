import { Box, Divider, FormControl, LinearProgress, Modal, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Order } from '../../orders/page';
import { Notification, ScheduledOrder } from '@/app/utils/type';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';

interface PropTypes extends ModalProps {
  order?: Order;
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleUpdateDateUI?: (orderId: number, updatedDate: string) => void;
  // handlePreOrder?: (deliveryDate: string) => void;
  isPreOrder?: boolean;
  scheduleOrderList?: ScheduledOrder[];
  progress?: number;
}

export default function EditDeliveryDate({
  open,
  onClose,
  order,
  setNotification,
  handleUpdateDateUI,
  // handlePreOrder,
  isPreOrder,
  scheduleOrderList,
  progress
}: PropTypes) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatedDate, setUpdatedDate] = useState<string>(() => {
    if (order) {
      return order.deliveryDate;
    }

    const deliveryDate = generateRecommendDate();
    return deliveryDate;
  });

  const handlePreOrder = async () => {
    setIsLoading(true);
    try {
      const submittedData: any = { deliveryDate: updatedDate };

      if (scheduleOrderList) {
        submittedData.scheduleOrderList = scheduleOrderList
      }

      const response = await axios.post(API_URL.ORDER, submittedData);

      if (response.data.error) {
        setIsLoading(false);
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      setIsLoading(false);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to update date: ', error);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update date: ' + error,
      });
    }
  };

  const handleUpdateDate = async () => {
    if (!order || !handleUpdateDateUI) {
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
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleUpdateDateUI(order.id, updatedDate);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      onClose();
    } catch (error: any) {
      console.log('Fail to update date: ', error);
      setIsLoading(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update date: ' + error,
      });
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
            <LoadingButtonStyles
              loading={isLoading}
              variant="contained"
              onClick={() => {
                if (isPreOrder) {
                  handlePreOrder();
                } else {
                  handleUpdateDate();
                }
              }}
              color={infoColor}
            >
              {isPreOrder ? 'Order' : 'Save'}
            </LoadingButtonStyles>
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
                />
              </LocalizationProvider>
            </FormControl>
            {progress !== undefined ? <LinearProgress variant="determinate" value={progress} /> : ''}
          </Box>
          
        </BoxModal>
      </Modal>
  );
}
