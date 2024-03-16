'use client';
import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { Order } from '../../overview/page';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../ComponentToPrint';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import axios from 'axios';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  order: Order;
  fetchOrders: () => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export default function OrderAccordion({
  order,
  setNotification,
  fetchOrders,
}: PropTypes) {
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isMarkButtonDisabled, setIsMarkButtonDisabled] =
    useState<boolean>(false);

  const handleOpenClientModal = (e: any) => {
    e.stopPropagation();
    setIsClientModalOpen(true);
  };

  const componentRef: any = useRef();
  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleMarkCompleted = async (e: any) => {
    e.stopPropagation();
    try {
      setIsMarkButtonDisabled(true);
      const response = await axios.put(API_URL.ORDER_STATUS, {
        ...order,
        status: ORDER_STATUS.COMPLETED,
      });
      await fetchOrders();
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
        categoryName={order.category}
      />
      <Accordion
        sx={{ borderRadius: 2, border: `1px solid white`, width: '100%' }}
      >
        <AccordionSummary>
          <Grid container alignItems="center">
            <Grid item xs={12} textAlign="right">
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
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrinting();
                  }}
                >
                  Print
                </MenuItem>
                <MenuItem
                  disabled={isMarkButtonDisabled}
                  onClick={handleMarkCompleted}
                >
                  Mark as completed
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography fontWeight="bold" variant="subtitle1">
                #{order.id}
              </Typography>
              <Typography variant="body2">Date: {order.date}</Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Button
                label={order.clientName}
                color="blue"
                onClick={handleOpenClientModal}
                width="auto"
              />
            </Grid>
            <Grid item xs={12} md={3} textAlign="center">
              <Typography fontWeight="bold" variant="subtitle1">
                Items: {order.items.length}
              </Typography>
              <Typography fontWeight="bold" variant="subtitle1">
                Total: ${order.totalPrice}
              </Typography>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: grey[50] }}>
          <Grid container rowGap={4} alignItems="flex-start">
            <Grid item textAlign="center" xs={6}>
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
                        <TableCell>${row.totalPrice}</TableCell>
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
              xs={6}
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
                <Typography fontWeight="bold">
                  {order.items.length} items
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography fontWeight="bold">Total</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">${order.totalPrice}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
