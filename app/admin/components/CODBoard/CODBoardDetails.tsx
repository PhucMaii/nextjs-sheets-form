import { Box, Button, Divider, Grid, IconButton, Menu, MenuItem, TextField, Typography } from '@mui/material';
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
import { SWRFetchData } from '@/app/utils/db';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { DropdownItemContainer } from '../../orders/styled';
import { errorColor, infoColor, primaryColor, successColor, warningColor } from '@/theme/color';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import LoadingModal from '../Modals/LoadingModal';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import axios from 'axios';


interface IProps {
  boardData: IBoard;
  onClose: () => void;
  showNotification: any;
  setIsOpenInsertOrders: any;
}

export default function CODBoardDetails({ boardData, onClose, showNotification, setIsOpenInsertOrders }: IProps) {
  const [actionButtonAnchor, setActionButtonAnchor] =
  useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [orders, setOrders] = useState<{displayOrders: Order[], baseOrders: Order[]}>({displayOrders: [], baseOrders: []});
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [searchKeywords, setSearchKeywords] = useState<string>('');
    const debouncedKeywords = useDebounce(searchKeywords, 1000);

    const [orderResponse, mutateOrders] = SWRFetchData(`${API_URL.ADMIN}/cod?id=${boardData.id}`);

    useEffect(() => {
      if (orderResponse) {
        setOrders({displayOrders: orderResponse.data.orders, baseOrders: orderResponse.data.orders});
        setIsLoading(false);
      } else {
        setIsLoading(true);
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

    const handleRemoveOrders = async () => {
      if (selectedOrders.length === 0) {
        showNotification('error', 'Please select at least one order');
        return;
      }

      setIsUpdating(true);
        try {
            const response = await axios.delete(`${API_URL.ADMIN}/cod/remove-orders`, {
              data: {
                orders: selectedOrders
              } 
            });

            if (response.data.error) {
                showNotification('error', response.data.error);
                setIsUpdating(false);
                return;
            }

            showNotification('success', response.data.message);
            mutateOrders();
            setIsUpdating(false);
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            showNotification('error', error.response.data.error);
            setIsUpdating(false);
            return;
        }
    }

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

    const handleUpdateOrderedItem = async (orderTotalPrice: number, order: Order, updatedItem: OrderedItems) => {
        try {
            await updateOrderedItems(orderTotalPrice, order, updatedItem, showNotification);
            mutateOrders();
        } catch (error: any) {
            console.log('Internal Server Error: ', error);
            showNotification('error', error.response.data.error);
            return;
        }
    }

    const handleUpdateStatus = async (status: ORDER_STATUS): Promise<void> => {
      setIsUpdating(true);
      if (selectedOrders.length === 0) {
        showNotification('error', 'Please select at least one order');
        return;
      };

      try {
        await updateStatus(status, selectedOrders, showNotification);
        mutateOrders();
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
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        width="100%"
      >
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
            setIsOpenInsertOrders(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Insert orders</Typography>
          </DropdownItemContainer>
        </MenuItem>
        <MenuItem
          onClick={handleRemoveOrders}
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
    )

  return (
    <>
    <LoadingModal open={isUpdating} />
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
          <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
            {actions}
            <Divider orientation="vertical" flexItem />
            <IconButton color="primary">
              <TuneIcon fontSize="medium" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      {/* Orders */}
      </Box>
      <Box display="flex" flexDirection="column" gap={2} sx={{maxHeight: '75vh', overflow: 'auto'}}>
        { isLoading ? (<LoadingComponent />) :
          orders.displayOrders.length > 0 && orders.displayOrders.map((order: Order, index: number) => (
              <OrderAccordion 
                key={index} 
                order={order} 
                showNotification={showNotification}
                handleUpdateItem={handleUpdateOrderedItem}
                selectedOrders={selectedOrders}
                handleSelectOrder={handleSelectOrder}
                mutateOrders={mutateOrders}
              />
          ))
        }
      </Box>
    </>
  );
}
