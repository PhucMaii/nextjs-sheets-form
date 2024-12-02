import { forwardRef, Fragment } from "react";
import { InvoicePrint } from "./InvoicePrint";
import './print.css';

export const MultipleInvoicePrint = forwardRef(({clientOrders, endDate}: {clientOrders: any, endDate: Date}, ref: any) => {
    console.log(clientOrders, 'clientOrders')
    return (
        <div ref={ref}>
            {clientOrders.map((order: any, index: number) => {
                return (
                    <Fragment key={index}>
                        <InvoicePrint client={order.client} orders={order.orders} ref={null} endDate={endDate} />
                        {index < clientOrders.length - 1 && <div className="page-break"></div>}
                    </Fragment>
                )   
            })}
        </div>
    )
})