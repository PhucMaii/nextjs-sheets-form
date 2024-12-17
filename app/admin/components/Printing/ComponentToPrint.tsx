import React, { forwardRef } from 'react';
import { Item, Order } from '../../orders/page';
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
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';

export const printFontSize = 28;

const generateTaxNote = (item: Item) => {
  if (item?.inventoryItem?.hasPST && item?.inventoryItem?.hasGST) {
    return '(P&G)';
  } else if (item?.inventoryItem?.hasPST) {
    return '(P)';
  } else if (item?.inventoryItem?.hasGST) {
    return '(G)';
  }
  return '';
};

export const ComponentToPrint = forwardRef(
  ({ order }: { order: Order | null }, ref: any) => {
    if (!order) {
      return null;
    }

    const [announcement] = SWRFetchData(`${API_URL.ADMIN}/announcement`);

    const orderDetailsTemplate = [];

    for (const item of order.items) {
      if (item.quantity > 0) {
        orderDetailsTemplate.push(
          <TableRow key={item.name}>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{generateTaxNote(item)}</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {item.quantity}
            </TableCell>
            <TableCell sx={{ fontSize: 18 }}>
              <Box display="flex" alignItems="center" gap={1} flexDirection="column">
                {item?.isShowDiscount && item?.prevPrice && (
                  <Typography
                    sx={{ textDecoration: 'line-through' }}
                  >
                    ${item.prevPrice}
                  </Typography>
                )}
                <Typography fontWeight="bold">
                  ${item.price}
                </Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ fontSize: 18 }}>
              <Box display="flex" alignItems="center" gap={1} flexDirection="column">
                {item?.isShowDiscount && item?.prevPrice && item?.totalPrevPrice?.toFixed(2) !== item.totalPrice.toFixed(2) && (
                  <Typography
                    sx={{ textDecoration: 'line-through' }}
                  >
                    ${item?.totalPrevPrice?.toFixed(2)}
                  </Typography>
                )}
                <Typography fontWeight="bold">
                  ${item.totalPrice?.toFixed(2)}
                </Typography>
              </Box>
            </TableCell>
          </TableRow>,
        );
      }
    }

    const orderFields: any = {
      Invoice: order.id,
      'Client Id': order?.clientId || order?.user?.clientId,
      'Client Name': order?.clientName || order?.user?.clientName,
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
          <Divider sx={{ my: 3, backgroundColor: 'black' }} />
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
            <Divider sx={{ mt: 3, backgroundColor: 'black' }} />
            <Grid container>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  Subtotal:
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  $
                  {order?.subTotal?.toFixed(2) ||
                    order?.totalPrice?.toFixed(2) ||
                    0}
                </Typography>
              </Grid>
             {order?.discount && order?.discount > 0 ? 
             <>
             <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  Discount ($):
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  -${order?.discount?.toFixed(2) || 0}
                </Typography>
              </Grid>
              </> : null
              }
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  PST (7%):
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  ${order?.PST?.toFixed(2) || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  GST (5%):
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  ${order?.GST?.toFixed(2) || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ my: 1 }}>
                <Divider sx={{backgroundColor: 'black'}}/>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  sx={{ fontSize: printFontSize - 5 }}
                  fontWeight="bold"
                >
                  Total:
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography
                  sx={{ fontSize: printFontSize - 5 }}
                  fontWeight="bold"
                >
                  ${order?.totalPrice?.toFixed(2) || 0}
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
                <Divider sx={{ mt: 1, mb: 3, backgroundColor: 'black' }} />
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  <strong>NOTE:</strong> {order.note}
                </Typography>
              </Grid>
            )}
            {announcement?.data?.announcement && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, backgroundColor: 'black' }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    textAlign="center"
                    sx={{ fontSize: printFontSize - 5 }}
                  >
                    * {announcement?.data?.announcement} *
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
          <Divider sx={{ my: 3, backgroundColor: 'black' }} />
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography>P: PST (7%)</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography textAlign="right">
                Order by: {order.createdBy}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>G: GST (5%)</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              {order?.updatedBy && (
                <Typography textAlign="right">
                  Updated by: {order.updatedBy}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </div>
    );
  },
);
