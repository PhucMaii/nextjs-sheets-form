import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import { ShadowSection } from '../../reports/styled';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import StatusText from '../StatusText';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { grey } from '@mui/material/colors';
import { IBoard } from '@/app/utils/type';
import { COD_STATUS, ORDER_STATUS } from '@/app/utils/enum';
import PendingIcon from '@mui/icons-material/Pending';
import useFilterOrders from '@/hooks/useFilterOrders';
import { Order } from '../../orders/page';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

interface IProps {
  boardData: IBoard;
  onSelect: any;
  handleDeleteBoard: any;
}

export default function CODBoardSummary({
  boardData,
  onSelect,
  handleDeleteBoard,
}: IProps) {
  const totalAmount = boardData.orders.reduce((acc: number, order: Order) => {
    return acc + order.totalPrice;
  }, 0);

  const uncollectedOrders = useFilterOrders(boardData.orders, [
    ORDER_STATUS.INCOMPLETED,
    ORDER_STATUS.DELIVERED,
  ]);

  const uncollectedAmount = uncollectedOrders.reduce(
    (acc: number, order: Order) => {
      return acc + order.totalPrice;
    },
    0,
  );

  const collectedOrders = useFilterOrders(boardData.orders, [
    ORDER_STATUS.COMPLETED,
  ]);

  const collectedAmount = collectedOrders.reduce(
    (acc: number, order: Order) => {
      return acc + order.totalPrice;
    },
    0,
  );

  return (
    <ShadowSection display="flex" flexDirection="column" gap={1} p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={0.5}>
          <RememberMeIcon fontSize="small" color="primary" />
          <Typography variant="body2">{boardData.createdBy}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <StatusText
            text={boardData.status}
            type={
              boardData.status === COD_STATUS.CLEARED ? 'success' : 'warning'
            }
            icon={
              boardData.status === COD_STATUS.CLEARED ? (
                <CheckIcon fontSize="small" color="success" />
              ) : (
                <PendingIcon fontSize="small" color="warning" />
              )
            }
          />
          <IconButton
            color="error"
            onClick={() => handleDeleteBoard(boardData.id)}
          >
            <RemoveCircleIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      <Grid container alignItems="stretch">
        <Grid item xs={12} md={8.9}>
          <Box>
            <Typography variant="h6">{boardData.driver.name}</Typography>
            <Typography variant="body2" color={grey[500]}>
              Delivered on: {boardData.date}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            flexWrap={'wrap'}
          >
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">
                ${boardData.cash}
              </Typography>
              <Typography variant="body2" color={grey[600]} textAlign="center">
                Cash Input
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">
                ${boardData?.expense?.amount?.toFixed(2) || 0}
              </Typography>
              <Typography variant="body2" color={grey[600]}>
                Expense
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">
                ${uncollectedAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color={grey[600]}>
                Uncollected Amount
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">
                ${collectedAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color={grey[600]}>
                Collected Amount
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h5" textAlign="center">
                {totalAmount.toFixed(2)}
              </Typography>
              <Typography variant="body2" color={grey[600]}>
                Total Amount
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={0.1}>
          <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
        </Grid>

        <Grid item xs={12} md={3} textAlign="center">
          <Box
            display="flex"
            flexDirection="column"
            gap={0.5}
            justifyContent="center"
            mb={2}
          >
            <Typography variant="h4" textAlign="center">
              {uncollectedOrders.length}
            </Typography>
            <Typography variant="body2" color={grey[600]}>
              Uncleared Orders
            </Typography>
          </Box>
          <Button variant="contained" onClick={onSelect}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="subtitle2">View details</Typography>
              <ArrowForwardIosIcon fontSize="small" />
            </Box>
          </Button>
        </Grid>
      </Grid>
    </ShadowSection>
  );
}
