import React, { forwardRef } from 'react';
import { ComponentToPrint } from './ComponentToPrint';
import './AllPrint.css';

export const AllPrint = forwardRef(({ orders }: { orders: any }, ref: any) => {
  return (
    <div ref={ref}>
      {orders.map((order: any, index: number) => (
        <React.Fragment key={index}>
          <ComponentToPrint order={order} ref={order.ref} />
          {index < orders.length - 1 && <div className="page-break"></div>}
        </React.Fragment>
      ))}
    </div>
  );
});
