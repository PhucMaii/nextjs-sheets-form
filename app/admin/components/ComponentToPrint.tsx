import React, { forwardRef } from 'react';
import { Order } from '../overview/page';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

export const ComponentToPrint = forwardRef(
  ({ order }: { order: Order }, ref: any) => {
    const orderDetailsTemplate = [];
    let totalPrice = 0;

    for (const item of order.items) {
      if (item.quantity > 0) {
        totalPrice += item.totalPrice;
        orderDetailsTemplate.push(
          <TableRow key={item.name}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>${item.price}</TableCell>
            <TableCell>${item.totalPrice}</TableCell>
          </TableRow>,
        );
      }
    }
    return (
      <div ref={ref}>
        <div className="flex gap-2 flex-col ml-4 mr-6 mb-24 mt-4 ">
          <div className="w-full">
            <h2 className="text-center">TEST: Supreme Sprouts LTD</h2>
            <h4 className="text-center font-semibold">
              1-6420 Beresford Street, Burnaby, BC, V5E 1B3
            </h4>
            <div className="text-center font-semibold">
              778 789 1060
              <br />
              709 789 6000
            </div>
          </div>
          <div className="h-px bg-black w-full m=auto"></div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap gap-2">
              <h3 className="text-left font-bold">Order Id: </h3>
              <h3 className="text-left">#{order.id}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <h3 className="text-left font-bold">Client Name: </h3>
              <h3 className="text-left">{order.clientName}</h3>
            </div>
            <div className="flex gap-2">
              <h3 className="text-left font-bold">Client Number:</h3>
              <h3 className="text-left">#{order.clientId}</h3>
            </div>
            <div className="flex gap-2">
              <h3 className="text-left font-bold">Order Time:</h3>
              <h3 className="text-left">{order.orderTime}</h3>
            </div>
            <div className="flex gap-2">
              <h3 className="text-left font-bold">Delivery Date:</h3>
              <h3 className="text-left">{order.deliveryDate}</h3>
            </div>
            <h3 className="text-left font-bold">ORDER DETAILS</h3>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>No. Items</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', marginRight: 4 }}>Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{orderDetailsTemplate}</TableBody>
            </Table>
            <div className="h-px bg-black w-full m=auto"></div>
            <div className="flex justify-between">
              <h3 className="text-left font-bold">Total:</h3>
              <h3 className="text-left font-bold mr-4">${totalPrice}</h3>
            </div>
            <h4 className="text-left font-medium">
              DELIVERY ADDRESS: {order.deliveryAddress}
            </h4>
            <h4 className="text-left font-medium">
              CONTACT: {order.contactNumber}
            </h4>
            {order.note && (
              <>
                <div className="h-px bg-black w-full m=auto"></div>
                <h4 className="text-left font-bold">NOTE</h4>
                <h4>{order.note}</h4>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);
