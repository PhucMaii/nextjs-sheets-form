import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { memo } from 'react';
import StatusText, { COLOR_TYPE } from './StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../orders/page';

interface PropTypes {
  clientOrders: Order[];
}

const ClientOrdersTable = ({ clientOrders }: PropTypes) => {
  return (
    <TableContainer sx={{ maxHeight: 800, mt: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Invoice Id</TableCell>
            <TableCell>Order Time</TableCell>
            <TableCell>Delivery Date</TableCell>
            <TableCell>Total Bill</TableCell>
            <TableCell>Status</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientOrders.map((order: Order) => {
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
              <TableRow>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.orderTime}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusText text={statusText.text} type={statusText.type} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button>Edit</Button>
                    <Button color="error">Delete</Button>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default memo(ClientOrdersTable, (prev, next) => {
  return prev.clientOrders === next.clientOrders;
});
