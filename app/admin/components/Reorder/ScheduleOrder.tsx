import { IRoutes, ScheduledOrder } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Checkbox,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import DeleteScheduleOrder from '../Modals/delete/DeleteScheduleOrder';
import { DELETE_OPTION } from '@/pages/api/admin/scheduledOrders/DELETE';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import EditScheduleOrder from '../Modals/edit/EditScheduleOrder';
import { green, grey } from '@mui/material/colors';
import { checkIsPreOrderQualified } from '@/app/utils/orders';
import { Verified } from '@mui/icons-material';

interface PropTypes {
  selectedOrders: ScheduledOrder[];
  handleSelectOrder: (e: any, order: ScheduledOrder) => void;
  scheduleOrder: ScheduledOrder;
  showNotification: (type: AlertColor, message: string) => void;
  handleDeleteOrderUI: (deletedOrder: ScheduledOrder) => void;
  routeId: number;
  routes: IRoutes[];
  handleUpdateOrderUI: (updatedOrder: ScheduledOrder) => void;
  mutateOrders: any;
}

const PreOrderColor = {
  ALREADY_ORDER: green[50] as string,
  BLOCKED: grey[200] as string,
} as const;

export default function ScheduleOrder({
  scheduleOrder,
  handleDeleteOrderUI,
  handleUpdateOrderUI,
  showNotification,
  handleSelectOrder,
  selectedOrders,
  routeId,
  routes,
  mutateOrders,
}: PropTypes) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const isOrderQualified = useMemo(() => {
    const isQualify = checkIsPreOrderQualified(scheduleOrder);

    return isQualify;
  }, [scheduleOrder]);

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
        showNotification('error', response.data.error);
        return;
      }

      handleDeleteOrderUI(order);
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ', error);
      showNotification('error', 'Fail to delete order: ' + error);
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
        showNotification={showNotification}
        handleUpdateOrderUI={handleUpdateOrderUI}
        mutateOrders={mutateOrders}
        handleDeleteOrderUI={handleDeleteOrderUI}
      />
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        py: 2,
        backgroundColor: scheduleOrder?.alreadyOrder
          ? PreOrderColor.ALREADY_ORDER
          : scheduleOrder?.blocked
            ? PreOrderColor.BLOCKED
            : '',
      }}
    >
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
        <Grid item md={2} xs={12} textAlign={mdDown ? 'right' : 'left'}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1">
              ${scheduleOrder.totalPrice.toFixed(2)}
            </Typography>
            { isOrderQualified && (
              <Verified fontSize="small" sx={{ color: green[500] }} />
            )

            }
          </Box>
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
