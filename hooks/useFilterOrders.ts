import { Order } from "@/app/admin/orders/page";
import { ORDER_STATUS } from "@/app/utils/enum";
import { useMemo } from "react";

const useFilterOrders = (orders: Order[], statuses: ORDER_STATUS[]) => {
    const filteredOrders = useMemo(() => {
        return orders.filter((order: Order) => {
            return statuses.includes(order.status);
        });
    }, [orders]);

    return filteredOrders;
}

export default useFilterOrders;