import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import StatusText, { COLOR_TYPE } from '../admin/components/StatusText';
import Button from './Button';
import { Item, Order } from '../admin/orders/page';
import ClientDetailsModal from '../admin/components/Modals/ClientDetailsModal';
import { ORDER_STATUS } from '../utils/enum';
import { grey } from '@mui/material/colors';

interface PropTypes {
    order: Order;
}

export default function OrderAccordion({ order }: PropTypes) {
    const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
    const totalQuantity = order.items.reduce((acc: number, cV: Item) => {
        return acc + cV.quantity
    }, 0);

    console.log(order, 'order')

    const statusText = {
        text: order.status,
        type:
          order.status === ORDER_STATUS.COMPLETED
            ? COLOR_TYPE.SUCCESS
            : order.status === ORDER_STATUS.INCOMPLETED
              ? COLOR_TYPE.WARNING
              : COLOR_TYPE.ERROR,
      };

  return (
    <>
    <ClientDetailsModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        deliveryAddress={order.deliveryAddress}
        contactNumber={order.contactNumber}
      />
    <Accordion>
      <AccordionSummary>
        <Grid container alignItems="center">
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <StatusText text={statusText.text} type={statusText.type} />
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
              label={order.clientName}
              color="blue"
              onClick={() => setIsClientModalOpen(true)}
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
            <Box
              display="flex"
              gap={2}
              alignItems="center"
              justifyContent="center"
            >
              <Typography fontWeight="bold" variant="subtitle1">
                Delivery Date: {order.deliveryDate}
              </Typography>
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
