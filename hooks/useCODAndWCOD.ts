import { Order } from '@/app/admin/orders/page';
import { days } from '@/app/lib/constant';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { useMemo } from 'react';

// Current date is in MM/DD/YYYY format
const useCODAndWCOD = (orderList: Order[], selectedDate: string) => {
  const wcodDay = useMemo(() => {
    const date = new Date(selectedDate);
    const dayIndex = date.getDay();

    return Object.values(PAYMENT_TYPE).find((paymentType: string) => {
      if (!paymentType.includes('WCOD')) {
        return false;
      }

      const day = paymentType.split(' - ')[1];
      return day === days[dayIndex];
    });
  }, [selectedDate]);

  const uncollectedCODOrders = useMemo(() => {
    return orderList.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        order.status !== ORDER_STATUS.VOID &&
        order.status !== ORDER_STATUS.COMPLETED
      );
    });
  }, [orderList]);

  const collectedCODOrders = useMemo(() => {
    return orderList.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        order.status === ORDER_STATUS.COMPLETED
      );
    });
  }, [orderList]);

  const uncollectedCODBill = useMemo(() => {
    return uncollectedCODOrders.length > 0
      ? uncollectedCODOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [uncollectedCODOrders]);

  const collectedCODBill = useMemo(() => {
    return collectedCODOrders.length > 0
      ? collectedCODOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [collectedCODOrders]);

  const codOrders = useMemo(() => {
    return orderList.filter((order: Order) => {
      return (
        (order?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.preference?.paymentType === wcodDay) &&
        order.status !== ORDER_STATUS.VOID
      );
    });
  }, [orderList]);

  const codBill = useMemo(() => {
    return codOrders.length > 0
      ? codOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [codOrders]);

  return {
    codOrders,
    codBill,
    uncollectedCODBill,
    uncollectedCODOrders,
    collectedCODBill,
    collectedCODOrders,
  };
};

export default useCODAndWCOD;
