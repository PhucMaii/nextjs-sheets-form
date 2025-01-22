import StatusText, { COLOR_TYPE } from '@/app/admin/components/StatusText';
import { ShadowSection } from '@/app/admin/reports/styled';
import {
  AlertColor,
  Box,
  Button,
  Fab,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SellIcon from '@mui/icons-material/Sell';
import AssistantDirectionIcon from '@mui/icons-material/AssistantDirection';
import { Item, Order } from '@/app/admin/orders/page';
import PreviewIcon from '@mui/icons-material/Preview';
import OrderDetails from './Modals/OrderDetails';
import ConfirmModal from './Modals/ConfirmModal';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import ClientDetailsModal from '@/app/admin/components/Modals/ClientDetailsModal';
import { OrderedItems } from '@/app/utils/type';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';

interface IProps {
  order: Order;
  handleUpdateStatus: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => Promise<void>;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function OrderComponent({
  order,
  handleUpdateStatus,
  handleUpdateItem,
  showNotification,
}: IProps) {
  const [confirmModalProps, setConfirmModalProps] = useState<any>({
    on: false,
    heading: '',
    color: 'primary',
    updatedStatus: ORDER_STATUS.DELIVERED,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
  const [isOpenClientDetails, setIsOpenClientDetails] =
    useState<boolean>(false);

  const abilityToEdit = useMemo(() => {
    const today = new Date();
    const deliveryDate = new Date(order.deliveryDate);

    return (
      today.getDate() === deliveryDate.getDate() &&
      today.getMonth() === deliveryDate.getMonth() &&
      today.getFullYear() === deliveryDate.getFullYear()
    );
  }, [order]);

  const statusText = {
    text: order.status,
    type:
      order.status === ORDER_STATUS.COMPLETED
        ? COLOR_TYPE.SUCCESS
        : order.status === ORDER_STATUS.DELIVERED
          ? COLOR_TYPE.INFO
          : order.status === ORDER_STATUS.INCOMPLETED
            ? COLOR_TYPE.WARNING
            : COLOR_TYPE.ERROR,
  };

  const totalQuantity = useMemo(() => {
    if (!order.items || order.items.length === 0) {
      return 0;
    }

    const quantity = order.items.reduce((acc: number, item: Item) => {
      return acc + item.quantity;
    }, 0);

    return quantity;
  }, [order]);

  const onRemoveOrderFromBoard = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL.DRIVER}/cod/remove-order?orderId=${order.id}`,
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
      showNotification('error', error.response.data.error);
      setIsLoading(false);
    }
  };

  return (
    <ShadowSection mt={1}>
      <ClientDetailsModal
        open={isOpenClientDetails}
        onClose={() => setIsOpenClientDetails(false)}
        deliveryAddress={order.user.deliveryAddress}
        contactNumber={order.user.contactNumber}
        categoryName={order.user.category.name}
      />
      <ConfirmModal
        open={confirmModalProps.on}
        onClose={() =>
          setConfirmModalProps({ ...confirmModalProps, on: false })
        }
        handleConfirm={handleUpdateStatus}
        heading={confirmModalProps.heading}
        color={confirmModalProps.color}
        updatedStatus={confirmModalProps.updatedStatus}
        orderId={order.id}
      />
      <OrderDetails
        open={isOpenDetails}
        onClose={() => setIsOpenDetails(false)}
        order={order}
        totalQuantity={totalQuantity}
        handleUpdateStatus={handleUpdateStatus}
        handleUpdateItem={handleUpdateItem}
        abilityToEdit={abilityToEdit}
      />
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={1}>
          <IconButton onClick={() => setIsOpenDetails(true)}>
            <PreviewIcon color="primary" />
          </IconButton>
        </Grid>
        <Grid item xs={5}>
          <StatusText text={statusText.text} type={statusText.type} />
        </Grid>
        <Grid item xs={6} textAlign="right">
          {abilityToEdit && (
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1}
              width="100%"
            >
              <Fab
                sx={{ zIndex: 0 }}
                onClick={() =>
                  setConfirmModalProps({
                    on: true,
                    heading: `Are you sure to void order for ${order.clientName}`,
                    color: 'error',
                    updatedStatus: ORDER_STATUS.VOID,
                  })
                }
                color="error"
                size="small"
              >
                <DeleteIcon />
              </Fab>
              {order.status === ORDER_STATUS.INCOMPLETED && (
                <Fab
                  sx={{ zIndex: 0 }}
                  onClick={() =>
                    setConfirmModalProps({
                      on: true,
                      heading: `Have you delivered order for ${order.clientName}`,
                      color: 'primary',
                      updatedStatus: ORDER_STATUS.DELIVERED,
                    })
                  }
                  color="primary"
                  size="small"
                >
                  <LocalShippingIcon />
                </Fab>
              )}
              {order.status !== ORDER_STATUS.COMPLETED && (
                <Fab
                  sx={{ zIndex: 0 }}
                  onClick={() =>
                    setConfirmModalProps({
                      on: true,
                      heading: `Have you delivered and collected money from order for ${order.clientName}`,
                      color: 'success',
                      updatedStatus: ORDER_STATUS.COMPLETED,
                    })
                  }
                  color="success"
                  size="small"
                >
                  <CreditScoreIcon />
                </Fab>
              )}
            </Box>
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">#{order.id}</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            {order?.notInRoute && (
              <LoadingButton
                loading={isLoading}
                color="error"
                onClick={onRemoveOrderFromBoard}
              >
                Remove
              </LoadingButton>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${order.user.deliveryAddressLat},${order.user.deliveryAddressLng}`}
              target="_blank"
              aria-disabled={
                !order.user?.deliveryAddressLat ||
                !order.user?.deliveryAddressLng
              }
              onClick={() => setIsOpenDetails(true)}
            >
              <AssistantDirectionIcon />
            </a>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">
            Order at: {order.orderTime}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1">
            Delivery Date: {order.deliveryDate}
          </Typography>
        </Grid>
        <Grid item textAlign="center" xs={12}>
          <Button
            onClick={() => setIsOpenClientDetails(true)}
            variant="contained"
          >
            {order.user.clientName}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" gap={1} alignItems="center">
              <SellIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {totalQuantity}
              </Typography>
            </Box>
            <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
          </Box>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
