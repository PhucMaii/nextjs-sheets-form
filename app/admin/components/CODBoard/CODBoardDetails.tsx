import { Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IBoard, OrderedItems } from '@/app/utils/type';
import { blueGrey } from '@mui/material/colors';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import OverviewBoard from './OverviewBoard';
import useDebounce from '@/hooks/useDebounce';
import TuneIcon from '@mui/icons-material/Tune';
import OrderAccordion from '../OrderAccordion';
import { Order } from '../../orders/page';
import { updateOrderedItems, updateStatus } from '@/app/utils/orders';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import InsertOrderToCodBoard from '../Modals/add/InsertOrderToCodBoard';
import { SWRFetchData } from '@/app/utils/db';

interface IProps {
  boardData: IBoard;
  onClose: () => void;
  showNotification: any;
  mutateBoards: any;
  setIsOpenInsertOrders: any;
}

export default function CODBoardDetails({ boardData, onClose, showNotification, mutateBoards, setIsOpenInsertOrders }: IProps) {
    const [orders, setOrders] = useState<{displayOrders: Order[], baseOrders: Order[]}>({displayOrders: [], baseOrders: []});
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [searchKeywords, setSearchKeywords] = useState<string>('');
    const debouncedKeywords = useDebounce(searchKeywords, 1000);

    const [orderResponse] = SWRFetchData(`${API_URL.ADMIN}/cod?id=${boardData.id}`);

    console.log(orderResponse, 'order response');

    useEffect(() => {
      if (orderResponse) {
        setOrders({displayOrders: orderResponse.data.orders, baseOrders: orderResponse.data.orders});
      }
    }, [orderResponse]);

    useEffect(() => {
        if (debouncedKeywords) {
            const newOrderList = boardData.orders.filter((order: Order) => {
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
            setOrders({...orders, displayOrders: newOrderList});
        } else {
            setOrders({...orders, displayOrders: orders.baseOrders});
        }
    }, [debouncedKeywords]);

    const handleSelectOrder = (e: any, targetOrder: Order) => {
      e.stopPropagation();
      e.preventDefault();
      const selectedOrder = selectedOrders.find((order: Order) => {
        return order.id === targetOrder.id;
      });
  
      if (selectedOrder) {
        const newSelectedOrders = selectedOrders.filter((order: Order) => {
          return order.id !== targetOrder.id;
        });
        setSelectedOrders(newSelectedOrders);
      } else {
        setSelectedOrders([...selectedOrders, targetOrder]);
      }
    };

    // const handleUpdateStatus = async (status: ORDER_STATUS, selectedOrders: Order[]) => {
    //     try {
    //         await updateStatus(status, selectedOrders, showNotification);
    //         mutateBoards();
    //     } catch (error: any) {
    //         console.log('Internal Server Error: ', error);
    //         showNotification('error', error.response.data.error);
    //         return;
    //     }
    // }

    const handleUpdateOrderedItem = async (orderTotalPrice: number, order: Order, updatedItem: OrderedItems) => {
        try {
            await updateOrderedItems(orderTotalPrice, order, updatedItem, showNotification);
            mutateBoards();
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            showNotification('error', error.response.data.error);
            return;
        }
    }

  return (
    <>
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton onClick={onClose}>
          <ArrowBackIcon fontSize="medium" />
        </IconButton>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" color={blueGrey[800]}>
            {boardData.driver.name}'s Board
          </Typography>
          <AssignmentIndIcon fontSize="medium" sx={{ color: blueGrey[800] }} />
        </Box>
      </Box>

      {/* Overview Cards */}
      <OverviewBoard boardData={{...boardData, orders: orders.baseOrders}} />

      {/* Search Bar */}
      <Grid container alignItems="center">
        <Grid item xs={11}>
            <TextField 
                value={searchKeywords}
                onChange={(e) => setSearchKeywords(e.target.value)}
                placeholder="Search Orders..."
                fullWidth
                variant="filled"
            />
        </Grid>
        <Grid item xs={1} textAlign="center">
            <IconButton>
                <TuneIcon />
            </IconButton>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" alignItems="center" my={1}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setIsOpenInsertOrders(true)}
        >
          + Insert Orders
        </Button>
      </Box>
      {/* Orders */}
      {
        orders.displayOrders.length > 0 && orders.displayOrders.map((order: Order, index: number) => (
            <OrderAccordion 
              key={index} 
              order={order} 
              showNotification={showNotification}
              handleUpdateItem={handleUpdateOrderedItem}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              mutateOrders={mutateBoards}
            />
        ))
      }
    </Box>
    </>
  );
}
