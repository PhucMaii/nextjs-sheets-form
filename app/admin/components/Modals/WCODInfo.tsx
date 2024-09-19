import { Modal, Typography } from '@mui/material';
import { BoxModal } from './styled';
import React, { Dispatch, SetStateAction } from 'react';
import { ModalProps } from './type';
import TodayRoute from '../TodayRoute';
import { Notification } from '@/app/utils/type';

interface IProps extends ModalProps {
  orderData: any;
  routes: any;
  date: string;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function WCODInfo({
  open,
  onClose,
  orderData,
  routes,
  date,
  setNotification,
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
          setNotification={setNotification}
        />
      </BoxModal>
    </Modal>
  );
}
