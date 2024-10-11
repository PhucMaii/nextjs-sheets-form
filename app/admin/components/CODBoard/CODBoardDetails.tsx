import { Box, Grid, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IBoard, OrderedItems } from '@/app/utils/type';
import { blueGrey } from '@mui/material/colors';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import OverviewBoard from './OverviewBoard';
import useDebounce from '@/hooks/useDebounce';
import TuneIcon from '@mui/icons-material/Tune';
import OrderAccordion from '../OrderAccordion';
import { Order } from '../../orders/page';
import { update } from 'lodash';
import { updateOrderedItems, updateStatus } from '@/app/utils/orders';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IProps {
  boardData: IBoard;
  onClose: () => void;
  showNotification: any;
  mutateBoards: any;
}

export default function CODBoardDetails({ boardData, onClose, showNotification, mutateBoards }: IProps) {
    const [searchKeywords, setSearchKeywords] = useState<string>('');

    const debouncedKeywords = useDebounce(searchKeywords, 1000);

    const handleUpdateStatus = async (status: ORDER_STATUS, selectedOrders: Order[]) => {
        try {
            await updateStatus(status, selectedOrders, showNotification);
            mutateBoards();
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            showNotification('error', error.response.data.error);
            return;
        }
    }

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
      <OverviewBoard boardData={boardData} />

      {/* Search Bar */}
      <Grid container alignItems="center">
        <Grid item xs={11}>
            <TextField 
                value={debouncedKeywords}
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

      {/* Orders */}
      {
        boardData.orders && boardData.orders.length > 0 && boardData.orders.map((order: Order, index: number) => (
            <OrderAccordion 
                key={index} 
                order={order} 
                showNotification={showNotification}
            />
        ))
      }
    </Box>
  );
}
