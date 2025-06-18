import { Order } from '@/app/admin/[companyId]/orders/page';
import { ORDER_STATUS } from '@/app/utils/enum';
import { PaymentStatus } from '@prisma/client';
import { useMemo } from 'react';

export const filterOrderByStatus = (
  orderList: Order[],
  statuses: ORDER_STATUS[],
) => {
  const filteredOrders = orderList.filter((order: Order) => {
    return statuses.includes(order.status);
  });

  return filteredOrders;
};

const useFilterOrders = (orders: Order[], statuses: ORDER_STATUS[] | PaymentStatus[] | any, type: 'fulfill' | 'payment' = 'fulfill') => {
  const filteredOrders = useMemo(() => {
    return orders?.filter((order: Order) => {
      const queryStatus: any = type === 'fulfill' ? order.status : order.paymentStatus;
      return statuses.includes(queryStatus);
    });
  }, [orders]);

  return filteredOrders;
};

export default useFilterOrders;
