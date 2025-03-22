import {
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  Modal,
  Radio,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Order } from '@/app/admin/orders/page';
import { BoxModal } from '../../admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import OrderAccordion from '../OrderAccordion';

interface PropTypes extends ModalProps {
  // itemList: any;
  lastOrder: Order;
  newOrder: Order;
  showNotification: (type: AlertColor, message: string) => void;
}
export default function OverrideOrder({
  open,
  onClose,
  lastOrder,
  // itemList,
  newOrder,
  showNotification,
}: PropTypes) {
  const [isOverriding, setIsOverriding] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order>(newOrder);

  const handleOverrideOrder = async () => {
    try {
      setIsOverriding(true);

      const itemsNo0 = selectedOrder.items.filter(
        (item: any) => item.quantity > 0,
      );
      // const correctedIdItems = currentItems.map((item: Item) => {
      //   const sameItemName: any = lastOrder.items.find(
      //     (targetItem: Item) => item.name === targetItem.name,
      //   );

      //   return { ...item, id: sameItemName.id };
      // });
      const response = await axios.put(API_URL.CLIENT_ORDER, {
        deliveryDate: selectedOrder.deliveryDate,
        note: selectedOrder.note,
        items: itemsNo0,
        orderId: lastOrder.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsOverriding(false);
      }

      showNotification('success', response.data.message);
      setIsOverriding(false);
      onClose();
    } catch (error: any) {
      console.log('Fail to override order: ', error);
      showNotification('error', 'Fail to override order: ' + error);
      setIsOverriding(false);
    }
  };

  return (
    <Modal open={open}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight={'80vh'}
        overflow={'auto'}
      >
        <Typography variant="h5" fontWeight="regular">
          You have already ordered for {lastOrder.deliveryDate}!
        </Typography>

        <Divider />

        <Box display="flex" alignItems="center" gap={1}>
          <Radio
            checked={JSON.stringify(selectedOrder) === JSON.stringify(newOrder)}
            onChange={() => setSelectedOrder(newOrder)}
          />
          <Typography variant="h6">Replace your existing order</Typography>
        </Box>
        <OrderAccordion order={newOrder} />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" alignItems="center" gap={1}>
          <Radio
            checked={
              JSON.stringify(selectedOrder) === JSON.stringify(lastOrder)
            }
            onChange={() => setSelectedOrder(lastOrder)}
          />
          <Typography variant="h6">Add-on to current order</Typography>
        </Box>
        <OrderAccordion order={lastOrder} />

        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <LoadingButton
              loading={isOverriding}
              onClick={() => handleOverrideOrder()}
              fullWidth
              variant="contained"
            >
              Save
            </LoadingButton>
          </Grid>
        </Grid>

        {/* <OrderView
          items={itemList}
          defaultDeliveryDate={lastOrder.deliveryDate}
          defaultOrder={lastOrder}
          defaultOrderedItems={lastOrder.items}
          isModal
          onSubmit={handleOverrideOrder}
          purpose={ORDER_USAGE_PURPOSE.ITEM}
          role={USER_ROLE.CLIENT}
        /> */}
        {/* <Box overflow="auto" maxHeight="70vh">
          <Grid container rowGap={2}>
            {lastOrder.items &&
              lastOrder.items.length > 0 &&
              lastOrder.items.map((item: Item, index: number) => {
                return (
                  <Grid item container key={index}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">{item.name}</Typography>
                      <Typography variant="subtitle2">
                        ${item.price} per bag
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" fontWeight="bold">
                        Order: {item.quantity} bags - $
                        {(item.quantity * item.price).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })}
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                NOTE: {lastOrder.note || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box> */}
      </BoxModal>
    </Modal>
  );
}
