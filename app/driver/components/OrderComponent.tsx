import StatusText, { COLOR_TYPE } from '@/app/admin/components/StatusText';
import { ShadowSection } from '@/app/admin/reports/styled';
import { Box, Button, Fab, Grid, IconButton, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SellIcon from '@mui/icons-material/Sell';
import AssistantDirectionIcon from '@mui/icons-material/AssistantDirection';
import { Item, Order } from '@/app/admin/orders/page';
import PreviewIcon from '@mui/icons-material/Preview';
import OrderDetails from './Modals/OrderDetails';
import ConfirmModal from './Modals/ConfirmModal';
import { ORDER_STATUS } from '@/app/utils/enum';
import ClientDetailsModal from '@/app/admin/components/Modals/ClientDetailsModal';
import { getGoogleMapsUrl } from '@/app/utils/googleMaps';

interface IProps {
  order: Order;
  handleUpdateStatus: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => Promise<void>;
}

export default function OrderComponent({ order, handleUpdateStatus }: IProps) {
  const [confirmModalProps, setConfirmModalProps] = useState<any>({
    on: false,
    heading: '',
    color: 'primary',
    updatedStatus: ORDER_STATUS.DELIVERED,
  });
  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
  const [isOpenClientDetails, setIsOpenClientDetails] =
    useState<boolean>(false);

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

  const handleNavigation = async () => {
    if (!order.user?.deliveryAddressLat || !order.user?.deliveryAddressLng) {
      return;
    }
    const url = await getGoogleMapsUrl(
      order.user.deliveryAddressLat,
      order.user.deliveryAddressLng,
    );
    // router.push(url);
    window.open(url, '_blank');
    setIsOpenDetails(true);
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
      />
      <Grid container alignItems="center" spacing={1}>
        <Grid item xs={1}>
          <IconButton onClick={() => setIsOpenDetails(true)}>
            <PreviewIcon color="primary" />
          </IconButton>
        </Grid>
        <Grid item xs={7}>
          <StatusText text={statusText.text} type={statusText.type} />
        </Grid>
        <Grid item xs={4} textAlign="right">
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            gap={1}
          >
            {order.status === ORDER_STATUS.INCOMPLETED && (
              <Fab
                sx={{ zIndex: 0 }}
                onClick={() =>
                  setConfirmModalProps({
                    on: true,
                    heading: `Have you deliver order for ${order.clientName}`,
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
                    heading: `Have you deliver and collect money from order for ${order.clientName}`,
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
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle1">#{order.id}</Typography>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <IconButton
              disabled={
                !order.user?.deliveryAddressLat ||
                !order.user?.deliveryAddressLng
              }
              onClick={handleNavigation}
            >
              <AssistantDirectionIcon color="primary" />
            </IconButton>
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
