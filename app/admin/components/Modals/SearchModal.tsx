import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ModalProps } from './type';
import { Item, Order } from '../../orders/page';
import { Box, Modal, TextField, Typography } from '@mui/material';
import { BoxModal } from './styled';
import useDebounce from '@/hooks/useDebounce';
import OrderAccordion from '../OrderAccordion';
import { Notification } from '@/app/utils/type';
import { SubCategory } from '@prisma/client';
import ErrorComponent from '../ErrorComponent';
import { blueGrey } from '@mui/material/colors';

interface IProps extends ModalProps {
  baseOrderList: Order[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  updateUI: (targetOrder: Order) => void;
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
  handleUpdateDateUI: (orderId: number, updatedDate: string) => void;
  handleUpdatePriceUI: (
    targetOrder: Order,
    newItems: any[],
    newTotalPrice: number,
  ) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, targetOrder: Order) => void;
  subcategories: SubCategory[];
}

export default function SearchModal({
  open,
  onClose,
  baseOrderList,
  setNotification,
  updateUI,
  updateUIItem,
  handleUpdateDateUI,
  handleUpdatePriceUI,
  selectedOrders,
  handleSelectOrder,
  subcategories,
}: IProps) {
  //   const [currentPage, setCurrentPage] = useState<number>(1);
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = baseOrderList.filter((order: Order) => {
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
    // setCurrentPage(1);
  }, [debouncedKeywords]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        height="80vh"
        display="flex"
        flexDirection="column"
        gap={2}
        maxWidth="80vh"
      >
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
              mb: 2
            }}
          >
            <Typography variant="h6">
              Total: {returnOrders.length} orders
            </Typography>
          </Box>
          {returnOrders.length > 0 ? (
            returnOrders.map((order: Order, index: number) => {
              return (
                <OrderAccordion
                  key={index}
                  order={order}
                  setNotification={setNotification}
                  updateUI={updateUI}
                  updateUIItem={updateUIItem}
                  handleUpdateDateUI={handleUpdateDateUI}
                  handleUpdatePriceUI={handleUpdatePriceUI}
                  selectedOrders={selectedOrders}
                  handleSelectOrder={handleSelectOrder}
                  subcategories={subcategories || []}
                />
              );
            })
          ) : (
            <ErrorComponent errorText="There is no orders" />
          )}
        </Box>
      </BoxModal>
    </Modal>
  );
}
