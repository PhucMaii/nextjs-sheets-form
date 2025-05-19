import React from 'react';
import { BoxModal } from '@/app/admin/[companyId]/components/Modals/styled';
import { ModalProps } from '@/app/admin/[companyId]/components/Modals/type';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { AlertColor, Box, Divider, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { USER_ROLE } from '@/app/utils/enum';
import OrderView, { ORDER_USAGE_PURPOSE } from '../OrderView';
import { SWRFetchData } from '@/app/utils/db';

interface PropTypes extends ModalProps {
  order: Order;
  showNotification: (type: AlertColor, message: string) => void;
  handleUpdateOrderUI: (updatedOrder: Order) => void;
}

export default function EditOrder({
  open,
  onClose,
  order,
  showNotification,
  handleUpdateOrderUI,
}: PropTypes) {
  const [items] = SWRFetchData(`/api/item?userId=${order.userId}`);

  // const handleChangeItem = (e: any, itemId: number) => {
  //   const newItemList = itemList.map((item: Item) => {
  //     if (item.id === itemId) {
  //       return { ...item, quantity: +e.target.value };
  //     }
  //     return item;
  //   });

  //   setItemList(newItemList);
  // };

  const onOverrideOrder = async (orderParam: Order) => {
    try {
      const response = await axios.put('/api/order', {
        deliveryDate: orderParam.deliveryDate,
        note: orderParam.note,
        items: orderParam.items,
        orderId: order.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
      }

      handleUpdateOrderUI(response.data.data);
      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Fail to override order: ', error);
      showNotification('error', 'Fail to override order: ' + error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        maxHeight="80vh"
        overflow="auto"
        flexDirection="column"
        gap={2}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h4">Override Order</Typography>

          <Divider />
          <OrderView
            items={items?.data?.items || []}
            onSubmit={onOverrideOrder}
            defaultDeliveryDate={order.deliveryDate}
            defaultOrderedItems={order.items}
            defaultOrder={order}
            purpose={ORDER_USAGE_PURPOSE.ITEM}
            isModal
            role={USER_ROLE.CLIENT}
          />
          {/* {!mdDown && (
            <LoadingButton
              variant="contained"
              disabled={itemList.length === 0}
              loading={isOverriding}
              onClick={handleOverrideOrder}
              sx={{
                backgroundColor: `${infoColor} !important`,
                '& .css-1yt7yx7-MuiLoadingButton-loadingIndicator': {
                  color: 'white', // Change the color to white
                },
              }}
            >
              SAVE
            </LoadingButton>
          )}
        </Box> */}
          {/* <Divider />
        <Box overflow="auto" maxHeight="70vh">
          <Grid container rowGap={3}>
            {itemList.length > 0 &&
              itemList.map((item: Item) => {
                return (
                  <Grid key={item.id} container item spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sx={{
                        color: !item.inventoryItemId ? grey[600] : 'black',
                      }}
                    >
                      {item.name} - ${item.price}
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        disabled={!item.inventoryItemId}
                        onChange={(e) => handleChangeItem(e, item.id)}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            <Grid container item spacing={1}>
              <Grid item xs={12}>
                NOTE
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Grid>
            </Grid>
            {mdDown && (
              <Grid container item xs={12} spacing={2}>
                <Grid item xs={6}>
                  <Button fullWidth variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    disabled={itemList.length === 0}
                    loading={isOverriding}
                    onClick={handleOverrideOrder}
                  >
                    SAVE
                  </LoadingButton>
                </Grid>
              </Grid>
            )}
          </Grid> */}
        </Box>
      </BoxModal>
    </Modal>
  );
}
