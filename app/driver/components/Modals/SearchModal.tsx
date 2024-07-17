import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Order } from '@/app/admin/orders/page';
import { Box, IconButton, Modal, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import useDebounce from '@/hooks/useDebounce';
import OrderComponent from '../OrderComponent';
import { ORDER_STATUS } from '@/app/utils/enum';
import ErrorComponent from '@/app/admin/components/ErrorComponent';
import { blueGrey, grey } from '@mui/material/colors';
import { OrderedItems } from '@/app/utils/type';

interface IProps extends ModalProps {
  orders: Order[];
  handleUpdateStatus: (
    orderId: number,
    updatedStatus: ORDER_STATUS,
  ) => Promise<void>;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => Promise<void>;
}

export default function SearchModal({
  open,
  onClose,
  orders,
  handleUpdateStatus,
  handleUpdateItem,
}: IProps) {
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [orderList, setOrderList] = useState<Order[]>([]);

  useEffect(() => {
    if (orders) {
      setOrderList(orders);
    }
  }, [orders]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = orderList.filter((order: Order) => {
        if (
          order.clientId.includes(debouncedKeywords) ||
          debouncedKeywords == order.id.toString() ||
          order.clientName
            .toLowerCase()
            .includes(debouncedKeywords.toLowerCase())
        ) {
          return true;
        }
        return false;
      });
      setReturnOrders(newOrderList);
    } else {
      setReturnOrders([]);
    }
  }, [debouncedKeywords, orderList]);
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight="80vh"
        overflow="auto"
        sx={{ backgroundColor: `${grey[100]} !important` }}
      >
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h5">Search orders</Typography>
        <TextField
          fullWidth
          name="Search"
          variant="filled"
          label="Search orders"
          placeholder="Search by client id, invoice id, or client name"
          value={searchKeywords}
          onChange={(e) => setSearchKeywords(e.target.value)}
        />
        <Box maxHeight="100%" overflow="auto">
          <Box
            sx={{
              backgroundColor: blueGrey[800],
              color: 'white',
              width: 'fit-content',
              padding: 1,
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography variant="h6">
              Total: {returnOrders.length} orders
            </Typography>
          </Box>
          {returnOrders.length > 0 ? (
            returnOrders.map((order: Order, index: number) => {
              return (
                <OrderComponent
                  key={index}
                  order={order}
                  handleUpdateStatus={handleUpdateStatus}
                  handleUpdateItem={handleUpdateItem}
                />
              );
            })
          ) : (
            <ErrorComponent errorText="No order found" />
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
