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
import { getAdminApiUrl } from '@/app/utils/enum';
import { header } from '@/app/lib/print';
import { generateOrderTotalPrice } from '@/pages/api/admin/[companyId]/orderedItems/PUT';
import { useParams } from 'next/navigation';

export const printFontSize = 28;

const generateTaxNote = (item: Item) => {
  if (item?.inventoryItem?.hasPST && item?.inventoryItem?.hasGST) {
    return 'P&G';
  } else if (item?.inventoryItem?.hasPST) {
    return 'P';
  } else if (item?.inventoryItem?.hasGST) {
    return 'G';
  }
  return '';
};

export const ComponentToPrint = forwardRef(
  ({ order }: { order: Order | null }, ref: any) => {
    if (!order) {
      return null;
    }

    const { companyId }: any = useParams();

    const [announcement] = SWRFetchData(
      getAdminApiUrl(companyId, '/announcement'),
    );

    const total = generateOrderTotalPrice(order.items);

    const totalPrice = total?.subTotal + (total?.PST || 0) + (total?.GST || 0);

    const orderDetailsTemplate: any = [];

    for (const item of order?.items || []) {
      if (item.quantity > 0) {
        orderDetailsTemplate.push(
          <TableRow key={item.name}>
            <TableCell sx={{}}>
              <Box display="flex" flexDirection="column">
                <Typography sx={{ fontSize: 18, fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                {item?.option?.name && (
                  <Typography sx={{ fontSize: 18 }}>
                    {item?.option?.name}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>
              {item.quantity}
            </TableCell>
            <TableCell sx={{ fontSize: 18 }}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                flexDirection="column"
              >
                {item?.isShowDiscount && item?.prevPrice && (
                  <Typography
                    sx={{
                      textDecoration: 'line-through',
                      textDecorationThickness: 2,
                    }}
                  >
                    ${item.prevPrice}
                  </Typography>
                )}
                <Typography fontWeight="bold">${item.price}</Typography>
              </Box>
            </TableCell>
            <TableCell sx={{ fontSize: 18 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                gap={1}
                flexDirection="column"
              >
                {/* {item?.isShowDiscount &&
                  item?.prevPrice &&
                  item?.totalPrevPrice?.toFixed(2) !==
                    item.totalPrice.toFixed(2) && (
                    <Typography sx={{ textDecoration: 'line-through' }}>
                      ${item?.totalPrevPrice?.toFixed(2)}
                    </Typography>
                  )} */}
                <Typography fontWeight="bold">
                  ${item.totalPrice?.toFixed(2)}
                </Typography>
                {/* <Typography>{generateTaxNote(item)}</Typography> */}
                <Typography sx={{ fontWeight: 'semibold' }}>
                  {generateTaxNote(item)}
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
        <Box
          display="flex"
          flexDirection="column"
          p={2}
          className="print-container"
        >
          {header(order)}
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
            <Table>
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
                    Qty
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
              {total?.discount && total?.discount > 0 ? (
                <>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: printFontSize - 5 }}>
                      Discount ($):
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography sx={{ fontSize: printFontSize - 5 }}>
                      -${total?.discount?.toFixed(2) || 0}
                    </Typography>
                  </Grid>
                </>
              ) : null}
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  Subtotal:
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  $
                  {total?.subTotal?.toFixed(2) ||
                    order?.subTotal?.toFixed(2) ||
                    0}
                </Typography>
              </Grid>
              {order?.shippingFee &&
                (order?.shippingFee > 0 && (
                  <>
                    <Grid item xs={4} textAlign="left" ml={2}>
                      <Typography>Shipping Fee</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography fontWeight="bold">
                        ${order?.shippingFee?.toFixed(2) || 0}
                      </Typography>
                    </Grid>
                  </>
                ))}
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  GST (5%):
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  ${total?.GST?.toFixed(2) || order?.GST?.toFixed(2) || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  PST (7%):
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography sx={{ fontSize: printFontSize - 5 }}>
                  ${total?.PST?.toFixed(2) || order?.PST?.toFixed(2) || 0}
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ my: 1 }}>
                <Divider sx={{ backgroundColor: 'black' }} />
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
                  $
                  {totalPrice?.toFixed(2) || order?.totalPrice?.toFixed(2) || 0}
                </Typography>
              </Grid>
            </Grid>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                <strong>DELIVERY ADDRESS:</strong>{' '}
                {order?.deliveryAddress ||
                  order?.user?.deliveryAddress ||
                  'Not Provided'}
              </Typography>
              <Typography sx={{ fontSize: printFontSize - 5 }}>
                <strong>CONTACT:</strong>{' '}
                {order?.contactNumber ||
                  order?.user?.contactNumber ||
                  'Not Provided'}
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
              <Typography>G: GST (5%)</Typography>
            </Grid>
            <Grid item xs={6} textAlign="right">
              <Typography textAlign="right">
                Order by: {order.createdBy}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>P: PST (7%)</Typography>
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
