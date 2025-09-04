'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Menu,
  Typography,
  IconButton,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { Order } from '../../orders/page';
import useDebounce from '@/hooks/useDebounce';
import useNotification from '@/hooks/useNotification';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl, ORDER_STATUS } from '@/app/utils/enum';
import axios from 'axios';
import { filterOrderByStatus } from '@/hooks/useFilterOrders';
import { PaymentStatus } from '@prisma/client';
import { updateStatus } from '@/app/utils/orders';
import { DropdownItemContainer } from '../../orders/styled';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  errorColor,
  infoColor,
  primaryColor,
  successColor,
  warningColor,
} from '@/theme/color';
import { USER_ROLE } from '@/app/utils/enum';
import PaidIcon from '@mui/icons-material/Paid';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Divider from '@mui/material/Divider';
import ListSubheader from '@mui/material/ListSubheader';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoneyOffOutlined from '@mui/icons-material/MoneyOffOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InfoIcon from '@mui/icons-material/Info';
import InsertOrderToCodBoard from '../../components/Modals/add/InsertOrderToCodBoard';
import EditCodBoard from '../../components/Modals/edit/EditCodBoard';
import UnsettledOrders from '../../components/Modals/UnsettledOrders';
import { blueGrey } from '@mui/material/colors';
import LoadingModal from '../../components/Modals/LoadingModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import EditIcon from '@mui/icons-material/Edit';
import StatusText from '../../components/StatusText';
import ErrorComponent from '../../components/ErrorComponent';
import OrderAccordion from '../../components/OrderAccordion';
import OverviewBoard from '../../components/Overview/OverviewBoard';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Sidebar from '../../components/Sidebar/Sidebar';
import { generateCurrentTime } from '@/app/utils/time';

export default function CODBoardDetailPage() {
  const { companyId, boardId }: any = useParams();
  const router = useRouter();

  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [filterButtonAnchor, setFilterButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openFilterDropdown = Boolean(filterButtonAnchor);
  const [isAutoAddBoard, setIsAutoAddBoard] = useState<boolean>(false);
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

  const { showNotification, NotificationComp } = useNotification();
  const debouncedKeywords = useDebounce(searchKeywords, 1000);

  const {
    data: boardResponse,
    isLoading: isValidating,
    refetch: refetchBoard,
  } = useQuery({
    queryKey: ['codBoard', Number(boardId)],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/cod?id=${boardId}`),
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (isValidating && !boardResponse) {
      setIsLoading(true);
    } else {
      const { orders } = boardResponse.data;
      setOrders(orders);
      setIsLoading(false);
    }
  }, [boardResponse, boardId]);

  useEffect(() => {
    if (boardResponse?.data?.date) {
      handleAutoAddBoard();
    }
  }, [boardResponse?.data?.date]); 

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
        getAdminApiUrl(companyId, `/cod/remove-orders`),
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
      refetchBoard();
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
      setIsUpdating(false);
      return;
    }
  };

  const filterOrders = (
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    const newOrderList = filterOrderByStatus(
      boardResponse?.data?.orders,
      [status],
      type,
    );
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

  const handleAutoAddBoard = async () => {
    setIsAutoAddBoard(true);
    try {
      const createdAt = generateCurrentTime();
      const response = await axios.post(
        getAdminApiUrl(companyId, '/cod/auto-add-board'),
        {
          todayString: boardResponse?.data?.date,
          createdAt,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAutoAddBoard(false);
        return;
      }

      refetchBoard();

    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      // showNotification('error', error.response.data.error);
    } finally {
      setIsAutoAddBoard(false);
    }
  };

  // const handleUpdateOrderedItem = async (
  //   orderTotalPrice: number,
  //   order: Order,
  //   updatedItem: OrderedItems,
  //   isConvertToCustom: boolean = false,
  // ) => {
  //   try {
  //     await updateOrderedItems(
  //       orderTotalPrice,
  //       order,
  //       updatedItem,
  //       showNotification,
  //       isConvertToCustom,
  //     );
  //     mutateBoard();
  //   } catch (error: any) {
  //     console.log('Internal Server Error: ', error);
  //     showNotification('error', error.response.data.error);
  //     return;
  //   }
  // };

  const handleUpdateStatus = async (
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfill' | 'payment' = 'fulfill',
  ): Promise<void> => {
    setIsUpdating(true);
    if (selectedOrders.length === 0) {
      showNotification('error', 'Please select at least one order');
      return;
    }

    try {
      await updateStatus(
        companyId,
        status,
        selectedOrders,
        showNotification,
        type,
      );
      refetchBoard();
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
            router.push(`/admin/${companyId}/transactions/create`);
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
        <Divider />
        <ListSubheader>Fulfillment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(ORDER_STATUS.DELIVERED);
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>Mark as fulfilled</Typography>
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
            <Typography>Mark as unfulfilled</Typography>
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
        <Divider />
        <ListSubheader>Payment Status</ListSubheader>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Paid, 'payment');
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>Mark as paid</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleUpdateStatus(PaymentStatus.Unpaid, 'payment');
          }}
          disabled={selectedOrders.length === 0}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <MoneyOffOutlined sx={{ color: errorColor }} />
            <Typography>Mark as unpaid</Typography>
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
            filterOrders(PaymentStatus.Paid, 'payment');
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckCircleIcon sx={{ color: successColor }} />
            <Typography>{PaymentStatus.Paid}</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.DELIVERED, 'fulfillment');
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <LocalShippingIcon sx={{ color: infoColor }} />
            <Typography>{ORDER_STATUS.DELIVERED}</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.INCOMPLETED, 'fulfillment');
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <PendingIcon sx={{ color: warningColor }} />
            <Typography>{ORDER_STATUS.INCOMPLETED}</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={() => {
            filterOrders(ORDER_STATUS.VOID, 'fulfillment');
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <BlockIcon sx={{ color: errorColor }} />
            <Typography>{ORDER_STATUS.VOID}</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Sidebar>
      {NotificationComp}
      {/* <AddExpense
          showNotification={showNotification}
          open={open.isOpenAddExpense}
          onClose={() => setOpen('isOpenAddExpense', false)}
          defaultValue={{
            date: boardData?.date,
            spentBy: `Driver - ${boardData?.employee?.name || 'N/A'}`,
          }}
          // handleAddExpenseId={handleAddExpenseId}
          codBoardId={boardData?.id}
          // paymentMethods={paymentMethods}
          // adminsAndDrivers={adminsAndDrivers}
        /> */}
      <InsertOrderToCodBoard
        open={isOpenInsertOrders}
        onClose={() => setIsOpenInsertOrders(false)}
        currentDate={boardResponse?.data?.date}
        showNotification={showNotification}
        boardId={boardResponse?.data?.id}
        mutateBoards={refetchBoard}
        role={USER_ROLE.ADMIN}
      />
      <EditCodBoard
        mutateBoard={refetchBoard}
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
        selectedOrders={selectedOrders}
        handleSelectOrder={handleSelectOrder}
        mutateOrders={refetchBoard}
        cashDiff={boardResponse?.data?.cashDiff || 0}
      />
      <LoadingModal open={isUpdating} />
      <Box display="flex" flexDirection="column" gap={2}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon fontSize="medium" />
          </IconButton>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h5" color={blueGrey[800]}>
              {boardResponse?.data?.employee?.name
                ? `${boardResponse?.data?.employee?.name}'s Board`
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
          <Grid item xs={12} md={10}>
            <TextField
              value={searchKeywords}
              onChange={(e) => setSearchKeywords(e.target.value)}
              placeholder="Search Orders..."
              fullWidth
              variant="filled"
            />
          </Grid>
          <Grid item xs={12} md={2} textAlign="right">
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="center"
              width="100%"
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
              // handleUpdateItem={handleUpdateOrderedItem}
              selectedOrders={selectedOrders}
              handleSelectOrder={handleSelectOrder}
              mutateOrders={refetchBoard}
              isMarkDateDifference={order.deliveryDate !== boardResponse?.data?.date}
              handleRemoveOrder={handleRemoveOrders}
              showAddedBy
            />
          ))
        )}
      </Box>
    </Sidebar>
  );
}
