'use client';
import React, {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Button from '@/app/components/Button';
import { grey } from '@mui/material/colors';
import ClientDetailsModal from '../Modals/ClientDetailsModal';
import { Item, Order } from '../../orders/page';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../ComponentToPrint';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { Notification, OrderedItems } from '@/app/utils/type';
import EditItemModal from '../Modals/EditItemModal';
import EditIcon from '@mui/icons-material/Edit';
import EditDeliveryDate from '../Modals/EditDeliveryDate';
import EditPrice from '../Modals/EditPrice';
import StatusText, { COLOR_TYPE } from '../StatusText';

interface PropTypes {
  order: Order;
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
  updateUI: (orderId: number) => void;
  handleUpdateDateUI: (orderId: number, updatedDate: string) => void;
}

const OrderAccordion = ({
  order,
  updateUIItem,
  setNotification,
  updateUI,
  handleUpdateDateUI,
}: PropTypes) => {
  console.log('Order ACcrodion re render')
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [isEditDateOpen, setIsEditDateOpen] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isMarkButtonDisabled, setIsMarkButtonDisabled] =
    useState<boolean>(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [isOpenEditPrice, setIsOpenEditPrice] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<OrderedItems | object>({});
  const [updatedItem, setUpdatedItem] = useState<OrderedItems>({
    name: '',
    price: 0,
    totalPrice: 0,
    quantity: 0,
  });
  const [totalQuantity, setTotalQuantity] = useState(0);
  const statusText = {
    text: order.status,
    type:
      order.status === ORDER_STATUS.COMPLETED
        ? COLOR_TYPE.SUCCESS
        : order.status === ORDER_STATUS.INCOMPLETED
          ? COLOR_TYPE.WARNING
          : COLOR_TYPE.ERROR,
  };

  useEffect(() => {
    calculateTotalQuantity();
  }, [order]);

  useEffect(() => {
    if (Object.keys(selectedItem).length > 0) {
      setIsOpenEditModal(true);
    }
  }, [selectedItem]);

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
      updateUI(order.id);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
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
        setNotification={setNotification}
        handleUpdateDateUI={handleUpdateDateUI}
      />
      <EditItemModal
        open={isOpenEditModal}
        onClose={() => {
          setIsOpenEditModal(false);
          setSelectedItem({});
        }}
        item={updatedItem}
        setItem={setUpdatedItem}
        setNotification={setNotification}
        updateUIItem={updateUIItem}
        order={order}
      />
      <EditPrice
        open={isOpenEditPrice}
        onClose={() => setIsOpenEditPrice(false)}
        items={order.items}
        setNotification={setNotification}
        order={order}
      />
      <Accordion
        sx={{ borderRadius: 2, border: `1px solid white`, width: '100%' }}
      >
        <AccordionSummary>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <StatusText text={statusText.text} type={statusText.type} />
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
                  <MenuItem onClick={() => setIsOpenEditPrice(true)}>
                    Edit price
                  </MenuItem>
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
                      isMarkButtonDisabled ||
                      order.status === ORDER_STATUS.COMPLETED
                    }
                    onClick={(e) =>
                      handleChangeStatus(e, ORDER_STATUS.COMPLETED)
                    }
                  >
                    Mark as completed
                  </MenuItem>
                  <MenuItem
                    disabled={
                      isMarkButtonDisabled ||
                      order.status === ORDER_STATUS.INCOMPLETED
                    }
                    onClick={(e) =>
                      handleChangeStatus(e, ORDER_STATUS.INCOMPLETED)
                    }
                  >
                    Mark as incompleted
                  </MenuItem>
                  <MenuItem
                    disabled={
                      isMarkButtonDisabled || order.status === ORDER_STATUS.VOID
                    }
                    onClick={(e) => handleChangeStatus(e, ORDER_STATUS.VOID)}
                  >
                    Mark as void
                  </MenuItem>
                </Menu>
              </Box>
            </Grid>
            <Grid item xs={12} md={2} sx={{ mr: 2 }}>
              <Typography fontWeight="bold" variant="subtitle1">
                #{order.id}
              </Typography>
              <Typography variant="body2">
                Order at: {order.orderTime}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                label={order.clientName}
                color="blue"
                onClick={handleOpenClientModal}
                width="auto"
              />
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography fontWeight="bold" variant="subtitle1">
                Items: {totalQuantity}
              </Typography>
              <Typography fontWeight="bold" variant="subtitle1">
                Total: ${order.totalPrice.toFixed(2)}
              </Typography>
              <Box display="flex" gap={2} alignItems="center">
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
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: grey[50] }}>
          <Grid container rowGap={4} alignItems="flex-start">
            <Grid item textAlign="center" xs={12} md={6}>
              <Typography fontWeight="bold" variant="h6">
                ORDER
              </Typography>
              <Table sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.length > 0 &&
                    order.items.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>${row.totalPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => {
                              setSelectedItem(row);
                              setUpdatedItem(row);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid
              container
              item
              textAlign="center"
              alignItems="center"
              rowGap={2}
              xs={12}
              md={6}
            >
              <Grid item xs={12}>
                <Typography fontWeight="bold" variant="h6">
                  NOTE
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {order.note ? order.note : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} mt={4}>
                <Typography fontWeight="bold" variant="h6">
                  TOTAL
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Number of items</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">{totalQuantity} items</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Total</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

export default memo(OrderAccordion, (prev, next) => {
  return prev.order === next.order
});