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
    const { debtData, sortDebtKeys } = useApiDebtData(client.id, endMonth);

    const today = new Date();
    const todayString = YYYYMMDDFormat(today);
    const ordersPerPage = 18;
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const totalPrices: number[] = [];

    // Calculate total bill for each page
    for (let i = 0; i < totalPages; i++) {
      const currentPageOrders = filteredOrders.slice(
        i * ordersPerPage,
        (i + 1) * ordersPerPage,
      );
      const totalPrice = currentPageOrders.reduce((acc: number, cV: Order) => {
        return acc + cV.totalPrice;
      }, 0);
      totalPrices.push(totalPrice);
    }

    const totalDue = totalPrices.reduce((acc: number, cV: number) => {
      return acc + cV;
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
                    To: {client?.clientName}
                  </Typography>
                </Grid>
                <Grid item textAlign="right" xs={12}>
                  <Typography>
                    IF PAYING BY INVOICE, CHECK INDIVIDUAL INVOICES PAID
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    Page: {pageIndex + 1} / {totalPages}
                  </Typography>
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
                        return (
                          <TableRow sx={{ height: '20px !important' }}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.deliveryDate}</TableCell>
                            <TableCell>
                              ${order.totalPrice.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Grid
                        container
                        display="flex"
                        justifyContent="space-around"
                        spacing={2}
                        flexWrap="wrap"
                      >
                        {[...Array(totalPages)].map((_, pageIndex) => {
                          return (
                            <Grid item>
                              <Box
                                display="flex"
                                flexDirection="column"
                                gap={1}
                              >
                                <Typography>Page {pageIndex + 1}</Typography>
                                <Typography>
                                  ${totalPrices[pageIndex].toFixed(2)}
                                </Typography>
                              </Box>
                            </Grid>
                          );
                        })}
                        <Grid item>
                          <Box display="flex" flexDirection="column" gap={1}>
                            <Typography fontWeight="bold">Total Due</Typography>
                            <Typography>${totalDue.toFixed(2)}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Grid
                        container
                        display="flex"
                        justifyContent="space-around"
                        spacing={2}
                        flexWrap="wrap"
                      >
                        {sortDebtKeys &&
                          sortDebtKeys.map((month: string, index: number) => {
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
                                      ? 'This month'
                                      : month}
                                  </Typography>
                                  <Typography>
                                    ${debtData[month].toFixed(2)}
                                  </Typography>
                                </Box>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          );
        })}
      </div>
    );
  },
);
