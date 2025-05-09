import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';

interface IProps {
  relevantItemPreOrders: any;
}

export default function RelevantPreOrdersTable({
  relevantItemPreOrders,
}: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Pre Order Id</TableCell>
          <TableCell>Client Id - Name</TableCell>
          <TableCell>Day</TableCell>
          <TableCell>Item Name</TableCell>
          <TableCell>Item Quantity</TableCell>
          <TableCell>Item Price</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {relevantItemPreOrders.length > 0 &&
          relevantItemPreOrders.map((item: any) => (
            <TableRow key={item?.id}>
              <TableCell>{item?.ScheduleOrders.id}</TableCell>
              <TableCell>
                {item?.ScheduleOrders?.user?.clientId} -{' '}
                {item?.ScheduleOrders?.user?.clientName}
              </TableCell>
              <TableCell>{item?.ScheduleOrders?.day}</TableCell>
              <TableCell>{item?.name}</TableCell>
              <TableCell>{item?.quantity}</TableCell>
              <TableCell>{item?.price}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
