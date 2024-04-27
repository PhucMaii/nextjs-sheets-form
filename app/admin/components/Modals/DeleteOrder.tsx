'use client';
import { Box, Button, Modal, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { BoxModal } from './styled';
import ErrorIcon from '@mui/icons-material/Error';
import { errorColor } from '@/app/theme/color';
import { Order } from '../../orders/page';
import { grey } from '@mui/material/colors';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';

interface PropTypes {
  order: Order;
  handleDeleteOrderUI: (deletedOrder: Order) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function DeleteOrder({
  order,
  handleDeleteOrderUI,
  setNotification,
}: PropTypes) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteOrder = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${API_URL.CLIENTS}/orders?orderId=${order.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsDeleting(false);
        return;
      }

      handleDeleteOrderUI(order);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsDeleting(false);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      setIsDeleting(false);
    }
  };
  return (
    <>
      <Button
        color="error"
        onClick={(e: any) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        DELETE
      </Button>
      <Modal open={isOpen}>
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <ErrorIcon sx={{ color: errorColor, fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: grey[600] }} fontWeight="bold">
            Are you sure to delete order {order.id} ?
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <LoadingButtonStyles
              color={errorColor}
              loading={isDeleting}
              onClick={handleDeleteOrder}
              variant="contained"
            >
              DELETE
            </LoadingButtonStyles>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
