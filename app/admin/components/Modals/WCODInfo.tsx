import { AlertColor, Modal, Typography } from '@mui/material';
import { BoxModal } from './styled';
import React from 'react';
import { ModalProps } from './type';
import TodayRoute from '../TodayRoute';

interface IProps extends ModalProps {
  orderData: any;
  routes: any;
  date: string;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function WCODInfo({
  open,
  onClose,
  orderData,
  routes,
  date,
  showNotification,
}: IProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <Typography variant="h5" textAlign="center">
          COD and WCOD Details
        </Typography>
        <TodayRoute
          orderData={orderData}
          routes={routes}
          date={date}
          showNotification={showNotification}
        />
      </BoxModal>
    </Modal>
  );
}
