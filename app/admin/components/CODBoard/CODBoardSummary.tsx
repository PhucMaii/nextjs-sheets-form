import {
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ShadowSection } from '../../reports/styled';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import StatusText from '../StatusText';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { grey } from '@mui/material/colors';
import { IBoard, IExpense } from '@/app/utils/type';
import { COD_STATUS, ORDER_STATUS } from '@/app/utils/enum';
import PendingIcon from '@mui/icons-material/Pending';
import useFilterOrders from '@/hooks/useFilterOrders';
import { Order } from '../../orders/page';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import EditIcon from '@mui/icons-material/Edit';
import EditCashInput from '../Modals/edit/EditCashInput';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ShowExpenses from '../Modals/ShowExpenses';

interface IProps {
  boardData: IBoard;
  onSelect: any;
  handleDeleteBoard: any;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function CODBoardSummary({
  boardData,
  onSelect,
  handleDeleteBoard,
  showNotification,
}: IProps) {
  const [isOpenShowExpenses, setIsOpenShowExpenses] = useState<boolean>(false);
  const [isOpenEditCashInput, setIsOpenEditCashInput] =
    useState<boolean>(false);

  const orderWithoutVOID = useFilterOrders(boardData.orders, [
    ORDER_STATUS.INCOMPLETED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.COMPLETED,
  ]);
  const totalAmount = orderWithoutVOID.reduce((acc: number, order: Order) => {
    return acc + order.totalPrice;
  }, 0);

  const totalExpense = useMemo(() => {
    if (!boardData?.expense || boardData?.expense.length === 0) {
      return 0;
    }

    return boardData?.expense.reduce((acc: number, expense: IExpense) => {
      return acc + expense.amount;
    }, 0);
  }, [boardData]);

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
    <>
      <ShowExpenses
        open={isOpenShowExpenses}
        onClose={() => setIsOpenShowExpenses(false)}
        expenses={boardData?.expense || []}
        showNotification={showNotification}
        boardData={boardData}
      />
      <EditCashInput
        open={isOpenEditCashInput}
        onClose={() => setIsOpenEditCashInput(false)}
        showNotification={showNotification}
        board={boardData}
      />
      <ShadowSection display="flex" flexDirection="column" gap={1} p={2}>
        {/* First Row */}
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <RememberMeIcon fontSize="small" color="primary" />
                <Typography variant="body2">{boardData.createdBy}</Typography>
              </Box>

              {boardData.cashDiff > 5 && (
                <StatusText
                  text={`Exceeding $${boardData.cashDiff.toFixed(2)} `}
                  type="error"
                  icon={<ErrorOutlineIcon fontSize="small" color="error" />}
                />
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6} textAlign="right">
            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
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
          </Grid>
        </Grid>

        <Grid container alignItems="stretch">
          <Grid item xs={12} md={8.9}>
            <Box>
              <Typography variant="h6">
                {boardData?.driver?.name || 'No Route Board'}
              </Typography>
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
              <Box display="flex" alignItems="flex-start">
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography variant="h5" textAlign="center">
                    ${boardData.cash}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={grey[600]}
                    textAlign="center"
                  >
                    Cash Input
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => setIsOpenEditCashInput(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box display="flex" alignItems="flex-start">
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Typography variant="h5" textAlign="center">
                    ${totalExpense}
                  </Typography>
                  <Typography variant="body2" color={grey[600]}>
                    Expense
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={() => setIsOpenShowExpenses(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
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
    </>
  );
}
