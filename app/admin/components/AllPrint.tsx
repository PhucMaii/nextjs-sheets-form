import React, { forwardRef } from 'react';
import { ComponentToPrint } from './ComponentToPrint';

export const AllPrint = forwardRef(({ orders }: { orders: any }, ref: any) => {
  return (
    <div ref={ref}>
      {orders.map((order: any) => {
        return <ComponentToPrint order={order} ref={order.ref} />;
      })}
    </div>
  );
});
