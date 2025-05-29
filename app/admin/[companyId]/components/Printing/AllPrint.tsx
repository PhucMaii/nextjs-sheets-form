import React, { forwardRef, memo } from 'react';
import './print.css';
import { ComponentToPrint } from './ComponentToPrint';

const AllPrint = forwardRef(({ orders }: { orders: any }, ref: any) => {
  return (
    <div ref={ref}>
      {orders.map((order: any, index: number) => {
        return (
          <React.Fragment key={order.id}>
            <ComponentToPrint order={order} ref={order.ref} />
            {index < orders.length - 1 && <div className="page-break"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
});

AllPrint.displayName = 'AllPrint';
export const MemoizedAllPrint = memo(AllPrint);
