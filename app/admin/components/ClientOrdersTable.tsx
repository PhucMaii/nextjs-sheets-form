'use clients';
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
import React, { Dispatch, SetStateAction, memo } from 'react';
import StatusText, { COLOR_TYPE } from './StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../orders/page';
import EditReportOrder from './Modals/EditReportOrder';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  clientOrders: Order[];
  handleUpdateOrderUI: (updatedOrder: Order) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
}

const ClientOrdersTable = ({
  clientOrders,
  handleUpdateOrderUI,
  setNotification,
}: PropTypes) => {
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
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.orderTime}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusText text={statusText.text} type={statusText.type} />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button color="error">Delete</Button>
                    <EditReportOrder
                      order={order}
                      setNotification={setNotification}
                      handleUpdateOrderUI={handleUpdateOrderUI}
                    />
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

export default memo(ClientOrdersTable);
