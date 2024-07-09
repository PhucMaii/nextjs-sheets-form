import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useMemo, useRef } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PrintIcon from '@mui/icons-material/Print';
import SellIcon from '@mui/icons-material/Sell';
import { Item, Order } from '../../orders/page';
import { Notification } from '@/app/utils/type';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import OrderDetailsTable from '../Tables/OrderDetailsTable';

interface IProps extends ModalProps {
  order: Order;
  setNotification: Dispatch<SetStateAction<Notification>>;
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
  isAdmin?: boolean;
}

export default function OrderDetails({
  open,
  onClose,
  order,
  setNotification,
  updateUIItem,
  isAdmin,
}: IProps) {
  const billPrintRef: any = useRef();

  const handlePrinting = useReactToPrint({
    content: () => billPrintRef.current,
  });

  const totalQuantity = useMemo(() => {
    const quantity = order.items.reduce((acc: number, cV: any) => {
      return acc + cV.quantity;
    }, 0);

    return quantity;
  }, [order]);

  return (
    <>
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={billPrintRef} />
      </div>
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          maxHeight="80vh"
          overflow="auto"
        >
          <Grid container alignItems="center">
            <Grid item xs={4}>
              <Typography variant="h6">#{order.id}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">{order.clientName}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item xs={10} md={6}>
              <Typography>Order at: {order.orderTime}</Typography>
            </Grid>
            <Grid item xs={2} md={6} textAlign="right">
              <IconButton onClick={handlePrinting}>
                <PrintIcon color="primary" />
              </IconButton>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <SellIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {totalQuantity}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {order.deliveryDate}
              </Typography>
            </Box>
            <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
          </Box>
          <Divider />
          <Grid container rowGap={4} alignItems="flex-start">
            <Grid item textAlign="center" xs={12}>
              <Typography fontWeight="bold" variant="h6">
                ORDER
              </Typography>
              <OrderDetailsTable
                order={order}
                setNotification={setNotification}
                updateUIItem={updateUIItem}
                isAdmin={isAdmin || false}
              />
            </Grid>
            <Grid
              container
              item
              textAlign="center"
              alignItems="center"
              rowGap={2}
              xs={12}
            >
              <Grid item xs={12}>
                <Typography fontWeight="bold" variant="h6">
                  NOTE
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {order.note ? order.note : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} mt={4}>
                <Typography fontWeight="bold" variant="h6">
                  TOTAL
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Number of items</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">{totalQuantity} items</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Total</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </BoxModal>
      </Modal>
    </>
  );
}
