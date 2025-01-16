import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IBoard, OrderedItems } from '@/app/utils/type';
import { blueGrey } from '@mui/material/colors';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import OverviewBoard from '../Overview/OverviewBoard';
import useDebounce from '@/hooks/useDebounce';
import TuneIcon from '@mui/icons-material/Tune';
import OrderAccordion from '../OrderAccordion';
import { Order } from '../../orders/page';
import { updateOrderedItems, updateStatus } from '@/app/utils/orders';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../../orders/styled';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  errorColor,
  infoColor,
  primaryColor,
  successColor,
  warningColor,
} from '@/theme/color';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import LoadingModal from '../Modals/LoadingModal';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import axios from 'axios';
import { filterOrderByStatus } from '@/hooks/useFilterOrders';
import ErrorComponent from '../ErrorComponent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import UnsettledOrders from '../Modals/UnsettledOrders';
import EditCodBoard from '../Modals/edit/EditCodBoard';
import EditIcon from '@mui/icons-material/Edit';
import InsertOrderToCodBoard from '../Modals/add/InsertOrderToCodBoard';
import PaidIcon from '@mui/icons-material/Paid';
import AddExpense from '../Modals/add/AddExpense';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import useNotification from '@/hooks/useNotification';
import StatusText from '../StatusText';
import { InfoIcon } from 'lucide-react';

interface IProps {
  boardData: IBoard;
  onClose: () => void;
  isAutoAddBoard?: boolean;
  // showNotification: any;
}

export default function CODBoardDetails({
  boardData,
  onClose,
  isAutoAddBoard,
  // showNotification,
}: IProps) {
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  // const [board, setBoard] = useState<IBoard>(boardData);
  const [filterButtonAnchor, setFilterButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openFilterDropdown = Boolean(filterButtonAnchor);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isOpenInsertOrders, setIsOpenInsertOrders] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpenEditCodBoard, setIsOpenEditCodBoard] = useState<boolean>(false);
  const [unsettledOrders, setUnsettledOrders] = useState<{
    isOpen: boolean;
    orders: Order[];
  }>({
    isOpen: false,
    orders: [],
  });
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [open, setOpen] = useMultipleBoolean({
    isOpenAddExpense: false,
  });
  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const [boardResponse, mutateBoard, isValidating] = SWRFetchData(
    `${API_URL.ADMIN}/cod?id=${boardData.id}`,
  );

  useEffect(() => {
    if (isValidating && !boardResponse) {
      setIsLoading(true);
    } else {
      const { orders } = boardResponse.data;
      setOrders(orders);
      setIsLoading(false);
    }
  }, [boardResponse, boardData]);

  useEffect(() => {
    if (debouncedKeywords) {
      const newOrderList = boardResponse?.data?.orders?.filter(
        (order: Order) => {
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
        },
      );
      setOrders(newOrderList);
    } else {
      setOrders(boardResponse?.data?.orders);
    }
  }, [debouncedKeywords]);

  const handleRemoveOrders = async (orders: Order[] = selectedOrders) => {
    if (orders.length === 0) {
      showNotification('error', 'Please select at least one order');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/cod/remove-orders`,
        {
          data: {
            orders: orders,
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        return;
      }

      showNotification('success', response?.data?.message);
      mutateBoard();
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
      setIsUpdating(false);
      return;
    }
  };

  const filterOrders = (status: ORDER_STATUS) => {
    const newOrderList = filterOrderByStatus(boardResponse?.data?.orders, [
      status,
    ]);
    setOrders(newOrderList);
  };

  const handleSelectAll = (e: any) => {
    e.preventDefault();
    if (selectedOrders.length === boardResponse?.data?.orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(boardResponse?.data?.orders);
    }
  };

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

  const handleUpdateOrderedItem = async (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => {
    try {
      await updateOrderedItems(
        orderTotalPrice,
        order,
        updatedItem,
        showNotification,
      );
      mutateBoard();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error.response.data.error);
      return;
    }
  };

  const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
    setIsUpdating(true);
    if (selectedOrders.length === 0) {
      showNotification('error', 'Please select at least one order');
      return;
    }

    try {
      await updateStatus(status, selectedOrders, showNotification);
      mutateBoard();
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to mark all as completed: ', error);
      showNotification(
        'error',
        'Something went wrong: ' + error.response.data.error,
      );
      setIsUpdating(false);
    }
  };

  // const handleAddExpenseId = async (id: number) => {
  //   try {
  //     const response = await axios.put(`${API_URL.ADMIN}/cod`, {
  //       id: boardData.id,
  //       updatedBoard: {
  //         date: boardData.date,
  //         driverId: boardData.driverId,
  //         expenseId: id,
  //       },
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       return;
  //     }

  //     mutateBoard();

  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('Internal Server Error: ', error);
  //     showNotification('error', error.response.data.error);
  //     return;
  //   }
  // };

  const actions = (
    <Box display="flex" alignItems="center" gap={2}>
      <Button
        variant="outlined"
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowDownwardIcon fontSize="small" />
          <Typography fontWeight="medium">Actions</Typography>
        </Box>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={() => setActionButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setOpen('isOpenAddExpense', true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PaidIcon sx={{ color: primaryColor }} />
            <Typography>Add Expense</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsOpenInsertOrders(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Insert orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => handleRemoveOrders()}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <RemoveCircleIcon sx={{ color: errorColor }} />
            <Typography>Remove orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.COMPLETED);
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as completed</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as delivered</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.INCOMPLETED);
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Mark as incompleted</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.VOID);
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Mark as void</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  const filter = (
    <Box display="flex" alignItems="center" gap={2} width="100%">
      <IconButton
        color="primary"
        onClick={(e: any) => setFilterButtonAnchor(e.currentTarget)}
      >
        <TuneIcon fontSize="medium" />
      </IconButton>

      <Menu
        id="basic-menu"
        anchorEl={filterButtonAnchor}
        open={openFilterDropdown}
        onClose={() => setFilterButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setOrders(boardResponse?.data?.orders);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <ReceiptLongIcon sx={{ color: primaryColor }} />
            <Typography>All</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.COMPLETED);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Completed</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.DELIVERED);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Delivered</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.INCOMPLETED);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>Incompleted</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.VOID);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>Void</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <>
      {NotificationComp}
      <AddExpense
        showNotification={showNotification}
        open={open.isOpenAddExpense}
        onClose={() => setOpen('isOpenAddExpense', false)}
        defaultValue={{
          date: boardData?.date,
          spentBy: `Driver - ${boardData?.driver?.name || 'N/A'}`,
        }}
        // handleAddExpenseId={handleAddExpenseId}
        codBoardId={boardData?.id}
        // paymentMethods={paymentMethods}
        // adminsAndDrivers={adminsAndDrivers}
      />
      <InsertOrderToCodBoard
        open={isOpenInsertOrders}
        onClose={() => setIsOpenInsertOrders(false)}
        currentDate={boardData?.date}
        showNotification={showNotification}
        boardId={boardData?.id}
        mutateBoards={mutateBoard}
      />
      <EditCodBoard
        mutateBoard={mutateBoard}
        showNotification={showNotification}
        open={isOpenEditCodBoard}
        onClose={() => setIsOpenEditCodBoard(false)}
        codBoard={boardResponse?.data || {}}
      />
      <UnsettledOrders
        open={unsettledOrders.isOpen}
        orders={unsettledOrders.orders}
        onClose={() => setUnsettledOrders({ isOpen: false, orders: [] })}
        showNotification={showNotification}
        handleUpdateItem={handleUpdateOrderedItem}
        selectedOrders={selectedOrders}
        handleSelectOrder={handleSelectOrder}
        mutateOrders={mutateBoard}
        cashDiff={boardResponse?.data?.cashDiff || 0}
      />
      <LoadingModal open={isUpdating} />
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={onClose}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" color={blueGrey[800]}>
              {boardResponse?.data?.driver?.name
                ? `${boardResponse?.data?.driver?.name}'s Board`
                : 'No Route Board'}
            </Typography>
            <AssignmentIndIcon
              fontSize="medium"
              sx={{ color: blueGrey[800] }}
            />
          </Box>
          <IconButton
            color="primary"
            onClick={() => setIsOpenEditCodBoard(true)}
          >
            <EditIcon fontSize="medium" />
          </IconButton>
        </Box>

        {/* Overview Cards */}
        <OverviewBoard
          boardData={{
            ...boardResponse?.data,
            orders: boardResponse?.data?.orders || [],
          }}
        />

        {/* Search Bar */}
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={10}>
            <TextField
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search Orders..."
              fullWidth
              variant="filled"
            />
          </Grid>
          <Grid item xs={2} textAlign="right">
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="flex-end"
            >
              {actions}
              <Divider orientation="vertical" flexItem />
              {filter}
            </Box>
          </Grid>
        </Grid>

        {isAutoAddBoard && (
          <Box mt={2}>
            <StatusText
              text="We are checking for new orders..."
              type="info"
              icon={<InfoIcon style={{ color: infoColor }} />}
            />
          </Box>
        )}

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  boardResponse?.data?.orders.length === selectedOrders.length
                }
                onClick={handleSelectAll}
              />
            }
            label="Select All"
          />

          {/* <Button
            sx={{ color: yellow[800] }}
            onClick={() =>
              setUnsettledOrders({
                isOpen: true,
                orders: boardResponse.data.expectedUnpaidOrders,
              })
            }
          >
            <Box display="flex" alignItems="center" gap={2}>
              <AutoAwesomeIcon />
              <Typography fontWeight="bold">Unsettled Orders</Typography>
            </Box>
          </Button> */}
        </Box>

        {/* Orders */}
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        sx={{ maxHeight: '75vh', overflow: 'auto' }}
      >
        {isLoading ? (
          <LoadingComponent />
        ) : orders.length === 0 ? (
          <ErrorComponent errorText="No orders found" />
        ) : (
          orders.map((order: Order, index: number) => (
            <OrderAccordion
              key={index}
              order={order}
              showNotification={showNotification}
              handleUpdateItem={handleUpdateOrderedItem}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              mutateOrders={mutateBoard}
              isMarkDateDifference={order.deliveryDate !== boardData.date}
              handleRemoveOrder={handleRemoveOrders}
            />
          ))
        )}
      </Box>
    </>
  );
}
