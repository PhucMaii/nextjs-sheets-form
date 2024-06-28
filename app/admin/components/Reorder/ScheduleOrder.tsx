import { IRoutes, Notification, ScheduledOrder } from '@/app/utils/type';
import {
  Box,
  Checkbox,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import DeleteScheduleOrder from '../Modals/delete/DeleteScheduleOrder';
import { DELETE_OPTION } from '@/pages/api/admin/scheduledOrders/DELETE';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import EditScheduleOrder from '../Modals/edit/EditScheduleOrder';

interface PropTypes {
  selectedOrders: ScheduledOrder[];
  handleSelectOrder: (e: any, order: ScheduledOrder) => void;
  scheduleOrder: ScheduledOrder;
  setNotification: Dispatch<SetStateAction<Notification>>;
  handleDeleteOrderUI: (deletedOrder: ScheduledOrder) => void;
  routeId: number;
  routes: IRoutes[];
  handleUpdateOrderUI: (updatedOrder: ScheduledOrder) => void;
}

export default function ScheduleOrder({
  scheduleOrder,
  handleDeleteOrderUI,
  handleUpdateOrderUI,
  setNotification,
  handleSelectOrder,
  selectedOrders,
  routeId,
  routes,
}: PropTypes) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  useEffect(() => {
    const isChecked = selectedOrders.some(
      (order: ScheduledOrder) => order.id === scheduleOrder.id,
    );
    setIsSelected(isChecked);
  }, [selectedOrders]);

  const handleDeleteOrder = async (
    order: ScheduledOrder,
    deleteOption: DELETE_OPTION,
  ) => {
    try {
      const response = await axios.delete(API_URL.SCHEDULED_ORDER, {
        data: {
          scheduleOrderId: order.id,
          deleteOption,
          userId: order.userId,
          routeId,
        },
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleDeleteOrderUI(order);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to delete order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to delete order: ' + error,
      });
    }
  };

  const actions = (
    <Box display="flex" gap={1}>
      <DeleteScheduleOrder
        targetObj={scheduleOrder}
        handleDelete={handleDeleteOrder}
      />
      <EditScheduleOrder
        routeId={routeId}
        routes={routes}
        order={scheduleOrder}
        setNotification={setNotification}
        handleUpdateOrderUI={handleUpdateOrderUI}
        handleDeleteOrderUI={handleDeleteOrderUI}
      />
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ py: 2 }}>
      <Grid container alignItems="center" spacing={1}>
        <Grid item md={1}>
          <Checkbox
            checked={isSelected}
            onClick={(e) => handleSelectOrder(e, scheduleOrder)}
          />
        </Grid>
        <Grid item md={1} xs={6}>
          <Typography variant="subtitle1">{scheduleOrder.id}</Typography>
        </Grid>
        {mdDown && (
          <Grid item md={1} xs={4}>
            {actions}
          </Grid>
        )}
        <Grid item xs={2}>
          <Typography variant="subtitle1">
            {scheduleOrder.user.clientId}
          </Typography>
        </Grid>
        <Grid item md={4} xs={10}>
          <Typography variant="subtitle1">
            {scheduleOrder.user.clientName}
          </Typography>
        </Grid>
        <Grid item md={2} xs={12} textAlign={mdDown ? "right" : "left"}>
          <Typography variant="subtitle1">
            ${scheduleOrder.totalPrice.toFixed(2)}
          </Typography>
        </Grid>
        {!mdDown && (
          <Grid item md={2}>
            {actions}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}
