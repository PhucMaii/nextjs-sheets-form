import { UserType } from '@/app/utils/type';
import React, { forwardRef } from 'react';
import { Order } from '../../orders/page';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { grey } from '@mui/material/colors';
import { ORDER_STATUS } from '@/app/utils/enum';
import useApiDebtData from '@/hooks/useApiDebtData';
import { sendChequeMsg } from '@/app/lib/constant';

interface PropTypes {
  client: UserType | null;
  orders: Order[];
  endDate: Date;
}

export const InvoicePrint = forwardRef(
  ({ client, orders, endDate }: PropTypes, ref: any) => {
    if (!client) {
      return;
    }

    const filteredOrders = orders.filter((order: Order) => {
      return (
        order.status !== ORDER_STATUS.VOID &&
        order.status !== ORDER_STATUS.COMPLETED
      );
    });

    // Debt Data
    const endMonth = endDate.getMonth() + 1;
    const { debtData, sortDebtKeys } = useApiDebtData(
      client.id,
      endMonth,
      orders,
    );

    const today = new Date();
    const todayString = YYYYMMDDFormat(today);
    const ordersPerPage = 15;
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const subtotal = filteredOrders.reduce((acc, order) => {
      return acc + (order?.subTotal || order?.totalPrice || 0);
    }, 0);

    const totalPST = filteredOrders.reduce((acc, order) => {
      return acc + (order?.PST || 0);
    }, 0);

    const totalGST = filteredOrders.reduce((acc, order) => {
      return acc + (order?.GST || 0);
    }, 0);

    return (
      <div ref={ref}>
        {[...Array(totalPages)].map((_, pageIndex) => {
          return (
            <Box
              p={6}
              key={pageIndex}
              style={{
                pageBreakAfter:
                  pageIndex === totalPages - 1 ? 'auto' : 'always',
              }}
            >
              <Grid container alignItems="flex-start">
                <Grid display="flex" flexDirection="column" item xs={4}>
                  <Typography variant="h6" fontWeight="bold">
                    Supreme Sprouts Ltd.
                  </Typography>
                  <Typography variant="subtitle1">
                    Unit 1 - 6420 Beresford Street
                  </Typography>
                  <Typography variant="subtitle1">
                    Burnaby, British Columbia V5E 1B6, Canada
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    STATEMENT
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Statement Date
                  </Typography>
                  <Typography>{todayString}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography fontWeight="bold" variant="h6">
                    To: {client.clientId} - {client.clientName}
                  </Typography>
                </Grid>
                <Grid item textAlign="right" xs={12}>
                  <Typography>
                    IF PAYING BY INVOICE, CHECK INDIVIDUAL INVOICES PAID
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      Page: {pageIndex + 1} / {totalPages}
                    </Typography>
                    <Typography variant="body2">
                      *: Tax Invoiced
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Table sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: grey[200] }}>
                      Invoice No.
                    </TableCell>
                    <TableCell sx={{ backgroundColor: grey[200] }}>
                      Delivery Date
                    </TableCell>
                    <TableCell sx={{ backgroundColor: grey[200] }}>
                      Total Bill
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders &&
                    filteredOrders
                      .slice(
                        pageIndex * ordersPerPage,
                        (pageIndex + 1) * ordersPerPage,
                      )
                      .map((order: Order) => {
                        const isTax = order?.items?.some((item) => item?.inventoryItem?.hasPST || item?.inventoryItem?.hasGST);
                        return (
                          <TableRow
                            key={order.id}
                            sx={{ height: '20px !important' }}
                          >
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.deliveryDate}</TableCell>
                            <TableCell sx={{ fontWeight: isTax ? 'bold' : '' }}>
                              ${order.totalPrice.toFixed(2)} {isTax && '*'}
                            </TableCell>
                          </TableRow>
                        );
                      })}

                  <TableRow>
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Subtotal:</TableCell>
                    <TableCell>${subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>PST (7%):</TableCell>
                    <TableCell>${totalPST.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>GST (5%):</TableCell>
                    <TableCell>${totalGST.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Total Bill:</TableCell>
                    <TableCell>
                      ${(subtotal + totalPST + totalGST).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Grid
                        container
                        display="flex"
                        justifyContent="space-between"
                        spacing={2}
                        flexWrap="wrap"
                      >
                        {sortDebtKeys &&
                          sortDebtKeys.map((month: string, index: number) => {
                            const localizedDebt = debtData[
                              month
                            ].toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                            return (
                              <Grid item key={index}>
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  gap={1}
                                >
                                  <Typography
                                    fontWeight={
                                      index === sortDebtKeys.length - 1
                                        ? 'bold'
                                        : ''
                                    }
                                  >
                                    {index === sortDebtKeys.length - 2
                                      ? 'Current Statement'
                                      : month}
                                  </Typography>
                                  <Typography>${localizedDebt}</Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={5}
              >
                <Typography variant="h6" textAlign="center">
                  {sendChequeMsg.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </div>
    );
  },
);
