import React, { forwardRef } from 'react';
import { Order } from '../../orders/page';
import {
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
import './print.css';

export const printFontSize = 28;
export const ComponentToPrint = forwardRef(
  ({ order }: { order: Order | null }, ref: any) => {
    if (!order) {
      return null;
    }

    const orderDetailsTemplate = [];
    let totalPrice = 0;

    for (const item of order.items) {
      if (item.quantity > 0) {
        totalPrice += item.totalPrice;
        orderDetailsTemplate.push(
          <TableRow key={item.name}>
            <TableCell sx={{ fontSize: 18, fontWeight: 'bold' }}>
              {item.name}
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {item.quantity}
            </TableCell>
            <TableCell sx={{ fontSize: 18 }}>${item.price}</TableCell>
            <TableCell sx={{ fontSize: 18 }}>
              ${item.totalPrice?.toFixed(2)}
            </TableCell>
          </TableRow>,
        );
      }
    }

    const orderFields: any = {
      Invoice: order.id,
      'Client Id': order.clientId,
      'Client Name': order.clientName,
      'Order Time': order.orderTime,
      'Delivery Date': order.deliveryDate,
    };
    return (
      <div ref={ref}>
        <Box display="flex" flexDirection="column" m={4}>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{ width: '100%' }}
          >
            <Typography variant="h6" fontWeight="bold">
              {order.isReplacement
                ? 'REPLACEMENT ORDER'
                : order.isVoid
                  ? 'VOID ORDER'
                  : ''}
            </Typography>
            <Typography textAlign="center" variant="h4" fontWeight="bold">
              SUPREME SPROUTS LTD
            </Typography>
            <Typography textAlign="center" variant="h5">
              1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            </Typography>
            <Typography variant="h5">
              778 789 1060
              <br />
              709 989 6000
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Grid container alignItems="center" rowGap={2} mb={2}>
            {orderFields &&
              Object.keys(orderFields).map(
                (orderField: string, index: number) => {
                  return (
                    <Grid key={index} item xs={12}>
                      <Typography sx={{ fontSize: printFontSize }}>
                        <strong>{orderField}:</strong> {orderFields[orderField]}
                      </Typography>
                    </Grid>
                  );
                },
              )}
            <Typography sx={{ fontSize: printFontSize }} fontWeight="bold">
              Order Details:{' '}
            </Typography>
            <Table sx={{ marginLeft: '-10px' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                  >
                    Item
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                  >
                    No. Items
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', fontSize: printFontSize - 5 }}
                  >
                    Unit Price
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      fontSize: printFontSize - 5,
                      marginRight: 4,
                    }}
                  >
                    Total Price
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{orderDetailsTemplate}</TableBody>
            </Table>
            <Divider sx={{ mt: 3 }} />
            <Grid container>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  Total:
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  ${totalPrice.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                <strong>DELIVERY ADDRESS:</strong> {order.deliveryAddress}
              </Typography>
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                <strong>CONTACT:</strong> {order.contactNumber}
              </Typography>
            </Box>
            {order.note && (
              <Grid item xs={12}>
                <Divider sx={{ mt: 1, mb: 3 }} />
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  <strong>NOTE:</strong> {order.note}
                </Typography>
              </Grid>
            )}
            {/* <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid> */}
            {/* <Grid item xs={12}>
              <Typography
                textAlign="center"
                sx={{ fontSize: printFontSize - 5 }}
              >
                * As of Sept 1st, we will no longer providing Premier Pacific
                Beansprouts. Please ask your driver for more details *
              </Typography>
            </Grid> */}
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography textAlign="right">Order by: {order.createdBy}</Typography>
          {order?.updatedBy && (
            <Typography textAlign="right">
              Updated by: {order.updatedBy}
            </Typography>
          )}
        </Box>
      </div>
    );
  },
);
