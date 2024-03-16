import React, { forwardRef } from 'react';
import { Order } from '../overview/page';

export const ComponentToPrint = forwardRef(
  ({ order }: { order: Order }, ref: any) => {
    const orderDetailsTemplate = [];
    let totalPrice = 0;

    for (const item of order.items) {
      if (item.quantity > 0) {
        totalPrice += item.totalPrice;
        orderDetailsTemplate.push(
          <h6 className="text-left text-sm">
            <strong>{item.name}</strong>: {item.quantity} x ${item.price} = $
            {item.totalPrice}
          </h6>,
        );
      }
    }
    return (
      <div ref={ref}>
        <div className="flex gap-2 flex-col ml-4 mr-4 mb-24 ">
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
            <div className="flex flex-wrap">
              <h3 className="text-left font-bold">Client Name: </h3>
              <h3 className="text-left">{order.clientName}</h3>
            </div>
            <div className="flex gap-2">
              <h3 className="text-left font-bold">Client Number:</h3>
              <h3 className="text-left">#{order.clientId}</h3>
            </div>
            <h3 className="text-left font-bold">ORDER DETAILS</h3>
            {orderDetailsTemplate}
            <div className="h-px bg-black w-full m=auto"></div>
            <div className="flex justify-between">
              <h3 className="text-left font-bold">Total:</h3>
              <h3 className="text-left font-bold">${totalPrice}</h3>
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
