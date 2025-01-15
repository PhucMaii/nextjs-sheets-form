import React, { forwardRef, memo } from 'react';
import { ComponentToPrint } from './ComponentToPrint';
import './print.css';

const MemoizedComponentToPrint = memo(ComponentToPrint);

const AllPrint = forwardRef(({ orders }: { orders: any }, ref: any) => {
  return (
    <div ref={ref}>
      {orders.map((order: any, index: number) => {
        return (
          <React.Fragment key={index}>
            <MemoizedComponentToPrint order={order} ref={order.ref} />
            {index < orders.length - 1 && <div className="page-break"></div>}
          </React.Fragment>
        );
      })}
    </div>
  );
});

export const MemoizedAllPrint = memo(AllPrint);
