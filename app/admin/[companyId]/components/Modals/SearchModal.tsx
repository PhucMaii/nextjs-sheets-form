import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { Order } from '../../orders/page';
import { AlertColor, Box, Modal, TextField, Typography } from '@mui/material';
import { BoxModal } from './styled';
import useDebounce from '@/hooks/useDebounce';
import OrderAccordion from '../OrderAccordion';
import ErrorComponent from '../ErrorComponent';
import { blueGrey } from '@mui/material/colors';

interface IProps extends ModalProps {
  baseOrderList: Order[];
  showNotification: (type: AlertColor, message: string) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, targetOrder: Order) => void;
  // subcategories: SubCategory[];
  // handleUpdateItem: (
  //   orderTotalPrice: number,
  //   order: Order,
  //   updatedItem: OrderedItems,
  // ) => Promise<void>;
  mutateOrders: any;
}

export default function SearchModal({
  open,
  onClose,
  baseOrderList,
  showNotification,
  selectedOrders,
  handleSelectOrder,
  // subcategories,
  // handleUpdateItem,
  mutateOrders,
}: IProps) {
  //   const [currentPage, setCurrentPage] = useState<number>(1);
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = baseOrderList.filter((order: Order) => {
        if (
          order.user.clientId.includes(debouncedKeywords) ||
          debouncedKeywords == order.id.toString() ||
          order.user.clientName
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
                <OrderAccordion
                  key={index}
                  order={order}
                  showNotification={showNotification}
                  selectedOrders={selectedOrders}
                  handleSelectOrder={handleSelectOrder}
                  // handleUpdateItem={handleUpdateItem}
                  mutateOrders={mutateOrders}
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
