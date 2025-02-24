import {
  AlertColor,
  Box,
  Button,
  Divider,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import { IRoutes, ScheduledOrder, IItem } from '@/app/utils/type';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import ModalHead from '@/app/lib/ModalHead';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { SWRFetchData } from '@/app/utils/db';
import { Order } from '@/app/admin/orders/page';

interface IProps {
  order: ScheduledOrder;
  showNotification: (type: AlertColor, message: string) => void;
  handleDeleteOrderUI: (targetOrder: ScheduledOrder) => void;
  routes: IRoutes[];
  routeId: number;
  mutateOrders: any;
}

export default function EditScheduleOrder({
  order,
  showNotification,
  handleDeleteOrderUI,
  routes,
  routeId,
  mutateOrders,
}: IProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [newRouteId, setNewRouteId] = useState<number>(routeId);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [sellingItems] = SWRFetchData(`${API_URL.ITEM}?userId=${order.userId}`);

  const switchRoute = async () => {
    if (newRouteId === routeId) {
      showNotification('warning', 'Route Has Not Been Changed');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        user: order.user,
        scheduledOrderId: order.id,
        oldRouteId: routeId,
        newRouteId,
      });

      if (response.data.error) {
        setIsSubmitting(false);
        showNotification('error', response.data.error);
        return;
      }

      handleDeleteOrderUI(order);

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update item: ' + error);
    }
  };

  const updateItems = async (orderParam: Order) => {
    try {
      setIsSubmitting(true);
      // const totalPrice = calculateNewTotalPrice();
      const response = await axios.put(API_URL.SCHEDULED_ORDER, {
        user: order.user,
        items: orderParam.items,
        scheduledOrderId: order.id,
      });

      if (response.data.error) {
        setIsSubmitting(false);
        showNotification('error', response.data.error);
        return;
      }

      // handleUpdateOrderUI({
      //   ...order,
      //   items: itemList,
      //   totalPrice,
      // });

      mutateOrders();

      showNotification('success', response.data.message);
      setIsSubmitting(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setIsSubmitting(false);
      showNotification('error', 'Fail to update item: ' + error);
    }
  };

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        Edit
      </Button>
      <Modal open={isOpen} onClose={() => setIsOpen(false)}>
        <BoxModal
          overflow="auto"
          maxHeight="80vh"
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModalHead
            heading="Edit Order"
            buttonLabel="EDIT"
            onClose={() => setIsOpen(false)}
            onClick={() => {}}
            buttonProps={{}}
            onlyHeading
          />
          <Divider />
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Route:</Typography>
            <Select
              value={newRouteId}
              onChange={(e) => setNewRouteId(+e.target.value)}
              fullWidth
            >
              {routes &&
                routes.map((route: IRoutes) => {
                  return (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name} - {route?.driver?.name}
                    </MenuItem>
                  );
                })}
            </Select>
            <Box display="flex" justifyContent="right">
              <LoadingButton
                variant="contained"
                onClick={switchRoute}
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Box>
          </Box>
          <Box>
            <Divider>Items</Divider>
            <OrderView
              items={sellingItems?.data || []}
              defaultOrderedItems={order?.items as IItem[]}
              onSubmit={updateItems}
              purpose={ORDER_USAGE_PURPOSE.ITEM}
              isPreOrder
              isModal
              role={USER_ROLE.ADMIN}
              clientName={order?.user?.clientName}
            />
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
