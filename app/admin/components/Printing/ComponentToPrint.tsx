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

const printFontSize = 28;
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
            <TableCell sx={{ fontSize: 18 }}>${item.totalPrice}</TableCell>
          </TableRow>,
        );
      }
    }

    const orderFields: any = {
      Invoice: order.id,
      'Client Name': order.clientName,
      'Order Time': order.orderTime,
      'Delivery Date': order.deliveryDate
    }
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
            <Typography variant="h4" fontWeight="bold">
              {order.isReplacement
                ? 'REPLACEMENT ORDER'
                : order.isVoid
                  ? 'VOID ORDER'
                  : ''}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              SUPREME SPROUTS LTD
            </Typography>
            <Typography textAlign="center" variant="h6">
              1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            </Typography>
            <Typography variant="h6">
            778 789 1060
            <br />
            709 989 6000
            </Typography>
          </Box>
          <Divider sx={{my: 3}} />
          <Grid container alignItems="center" rowGap={3} mb={2}>
            {
              orderFields && Object.keys(orderFields).map((orderField: string, index: number) => {
                return (
                  <Grid key={index} item xs={12}>
                    <Typography variant="h5" sx={{fontSize: printFontSize}}><strong>{orderField}:</strong> {orderFields[orderField]}</Typography>
                  </Grid>
                )
              })
            }
            <Typography sx={{fontSize: printFontSize}} fontWeight="bold">Order Details: </Typography>
            <Table sx={{ marginLeft: '-10px' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: printFontSize - 10 }}>
                    Item
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: printFontSize - 10 }}>
                    No. Items
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: printFontSize - 10 }}>
                    Unit Price
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', fontSize: printFontSize - 10, marginRight: 4 }}
                  >
                    Total Price
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{orderDetailsTemplate}</TableBody>
            </Table>
            <Divider sx={{mt: 3}} />
            {/* <div className="flex justify-between text-2xl">
              <h3 className="text-left font-bold">Total:</h3>
              <h3 className="text-left font-bold mr-8">
                ${totalPrice.toFixed(2)}
              </h3>
            </div> */}
            <Grid container>
              <Grid item xs={6}>
                <Typography sx={{fontSize: printFontSize - 5}}>Total:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{fontSize: printFontSize - 5}}>${totalPrice.toFixed(2)}</Typography>
              </Grid>
            </Grid>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography sx={{fontSize: printFontSize - 10}}>
                <strong>DELIVERY ADDRESS:</strong> {order.deliveryAddress}
              </Typography>
              <Typography sx={{fontSize: printFontSize - 10}}>
                <strong>CONTACT:</strong> {order.contactNumber}
              </Typography>
            </Box>
            {order.note && (
              <Grid item xs={12}>
                <Divider sx={{mt: 1, mb: 3}} />
                {/* <h4 className="text-left font-bold text-xl">NOTE</h4>
                <h4 className="text-xl">{order.note}</h4> */}
                <Typography sx={{fontSize: printFontSize - 10}}><strong>NOTE:</strong> {order.note}</Typography>
              </Grid>
            )}
            </Grid>
        </Box>
      </div>
    );
  },
);
