'use client';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ClientDetailsModal from './Modals/ClientDetailsModal';
import { Order } from '../orders/page';
import { useReactToPrint } from 'react-to-print';
import SellIcon from '@mui/icons-material/Sell';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { OrderedItems } from '@/app/utils/type';
import EditIcon from '@mui/icons-material/Edit';
import EditDeliveryDate from './Modals/edit/EditDeliveryDate';
import EditPrice from './Modals/edit/EditPrice';
import StatusText, { COLOR_TYPE } from './StatusText';
import { ComponentToPrint } from './Printing/ComponentToPrint';
import { ShadowSection } from '../reports/styled';
import PreviewIcon from '@mui/icons-material/Preview';
import OrderDetails from './Modals/OrderDetails';
import RememberMeIcon from '@mui/icons-material/RememberMe';

interface PropTypes {
  order: Order;
  showNotification: (type: AlertColor, message: string) => void;
  handleUpdateStatusUI: (targetOrder: Order) => void;
  handleUpdateDateUI: (orderId: number, updatedDate: string) => void;
  handleUpdatePriceUI: (
    targetOrder: Order,
    newItems: any[],
    newTotalPrice: number,
  ) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, targetOrder: Order) => void;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
  ) => Promise<void>;
  mutateOrders: any;
}

const OrderAccordion = ({
  order,
  showNotification,
  handleUpdateStatusUI,
  handleUpdateDateUI,
  handleUpdatePriceUI,
  handleSelectOrder,
  selectedOrders,
  handleUpdateItem,
  mutateOrders,
}: PropTypes) => {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [isEditDateOpen, setIsEditDateOpen] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isMarkButtonDisabled, setIsMarkButtonDisabled] =
    useState<boolean>(false);
  const [isOpenEditPrice, setIsOpenEditPrice] = useState<boolean>(false);
  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const statusText = {
    text: order.status,
    type:
      order.status === ORDER_STATUS.COMPLETED
        ? COLOR_TYPE.SUCCESS
        : order.status === ORDER_STATUS.DELIVERED
          ? COLOR_TYPE.INFO
          : order.status === ORDER_STATUS.INCOMPLETED
            ? COLOR_TYPE.WARNING
            : COLOR_TYPE.ERROR,
  };

  const isOrderSelected = selectedOrders.some(
    (targetOrder: Order) => order.id === targetOrder.id,
  );

  const latestUpdatePerson = useMemo(() => {
    if (!order.createdBy && !order.updatedBy) {
      return 'Unknown';
    }

    if (order.updatedBy) {
      return order.updatedBy;
    }

    return order.createdBy;
  }, [order]);

  useEffect(() => {
    calculateTotalQuantity();
  }, [order]);

  const handleOpenClientModal = (e: any) => {
    e.stopPropagation();
    setIsClientModalOpen(true);
  };

  const componentRef: any = useRef();
  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleChangeStatus = async (e: any, status: ORDER_STATUS) => {
    e.stopPropagation();
    try {
      setIsMarkButtonDisabled(true);
      const response = await axios.put(API_URL.ORDER_STATUS, {
        ...order,
        status,
      });

      // Optimistic Data Update
      handleUpdateStatusUI(response.data.data);

      // Update Real Data
      mutateOrders();
      showNotification('success', response.data.message);
      setIsMarkButtonDisabled(false);
    } catch (error) {
      console.log('Fail to mark as completed: ', error);
    }
  };

  const calculateTotalQuantity = () => {
    const quantity = order.items.reduce((acc: number, cV: any) => {
      return acc + cV.quantity;
    }, 0);

    setTotalQuantity(quantity);
  };

  const actions = (
    <>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => setIsOpenEditPrice(true)}>Edit price</MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handlePrinting();
          }}
        >
          Print
        </MenuItem>
        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.COMPLETED
          }
          onClick={(e) => handleChangeStatus(e, ORDER_STATUS.COMPLETED)}
        >
          Mark as completed
        </MenuItem>
        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.COMPLETED
          }
          onClick={(e) => handleChangeStatus(e, ORDER_STATUS.DELIVERED)}
        >
          Mark as delivered
        </MenuItem>
        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.INCOMPLETED
          }
          onClick={(e) => handleChangeStatus(e, ORDER_STATUS.INCOMPLETED)}
        >
          Mark as incompleted
        </MenuItem>
        <MenuItem
          disabled={isMarkButtonDisabled || order.status === ORDER_STATUS.VOID}
          onClick={(e) => handleChangeStatus(e, ORDER_STATUS.VOID)}
        >
          Mark as void
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <>
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={componentRef} />
      </div>
      <ClientDetailsModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        deliveryAddress={order.deliveryAddress}
        contactNumber={order.contactNumber}
        categoryName={order.category.name}
      />
      <EditDeliveryDate
        open={isEditDateOpen}
        onClose={() => setIsEditDateOpen(false)}
        order={order}
        showNotification={showNotification}
        handleUpdateDateUI={handleUpdateDateUI}
        mutateOrders={mutateOrders}
      />
      <EditPrice
        open={isOpenEditPrice}
        onClose={() => setIsOpenEditPrice(false)}
        items={order.items}
        showNotification={showNotification}
        order={order}
        handleUpdatePriceUI={handleUpdatePriceUI}
        mutateOrders={mutateOrders}
      />
      <OrderDetails
        open={isOpenDetails}
        onClose={() => setIsOpenDetails(false)}
        order={order}
        handleUpdateItem={handleUpdateItem}
      />
      <ShadowSection>
        <Grid container alignItems="center" columnSpacing={1}>
          <Grid item sm={0.5} xs={2}>
            <Checkbox
              checked={isOrderSelected}
              onClick={(e: any) => handleSelectOrder(e, order)}
            />
          </Grid>
          <Grid item xs={2}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <RememberMeIcon fontSize="small" color="primary" />
              <Typography variant="body2">{latestUpdatePerson}</Typography>
            </Box>
          </Grid>
          <Grid item xs={10} md={8}>
            <Box display="flex" alignItems="center" gap={1}>
              {order.isReplacement && (
                <StatusText text={`Replacement by client `} type={'error'} />
              )}
              {order.isVoid && (
                <StatusText
                  text={`Void by ${order?.updatedBy || 'client'} `}
                  type={'error'}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={1.5} textAlign="right">
            {actions}
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <StatusText text={statusText.text} type={statusText.type} />
              <IconButton onClick={() => setIsOpenDetails(true)}>
                <PreviewIcon color="primary" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={2} sx={{ mr: 2 }}>
            <Typography fontWeight="bold" variant="subtitle1">
              #{order.id}
            </Typography>
            <Typography variant="body2">Order at: {order.orderTime}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              color="info"
              variant="contained"
              onClick={handleOpenClientModal}
            >
              {order.clientName}
            </Button>
          </Grid>
          <Grid item xs={12} md={3} textAlign="left" alignItems="center">
            <Box
              display="flex"
              gap={1}
              alignItems="center"
              justifyContent="center"
            >
              <Typography fontWeight="bold" variant="subtitle1">
                Delivery Date: {order.deliveryDate}
              </Typography>
              <IconButton
                sx={{ width: '25px', height: '25px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDateOpen(true);
                }}
              >
                <EditIcon sx={{ width: '20px', height: '20px' }} />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" gap={1} alignItems="center">
                <SellIcon color="primary" />
                <Typography color="primary" variant="subtitle1">
                  {totalQuantity}
                </Typography>
              </Box>
              <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
            </Box>
          </Grid>
        </Grid>
      </ShadowSection>
    </>
  );
};

// only re renders if th order data change
export default memo(OrderAccordion);
