import { Order } from '@/app/admin/orders/page';
import { fetchWcodOrders } from '@/app/utils/db';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { getWCODDay } from '@/app/utils/time';
import { useEffect, useMemo, useState } from 'react';

// Current date is in MM/DD/YYYY format
const useCODAndWCOD = (orderList: Order[], selectedDate: string) => {
  const [wcod, setWcod] = useState<any>(null);

  const wcodDay: any = useMemo(() => {
    const day = getWCODDay(selectedDate);
    return day;
  }, [selectedDate, orderList]);

  useEffect(() => {
    if (orderList.length > 0 && wcodDay) {
      handleFetchWCOD();
    }
  }, [orderList, wcodDay]);

  const handleFetchWCOD = async () => {
      const wcodResponse = await fetchWcodOrders(orderList, selectedDate, wcodDay);
      setWcod(wcodResponse);
  }

  const uncollectedCODOrders = useMemo(() => {
    const orders = [...orderList];

    if (wcod) {
      orders.push(...wcod.wcodOrders);
    }

    return orders.filter((order: Order) => {
      return (
        (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.user?.preference?.paymentType === wcodDay) &&
        order.status !== ORDER_STATUS.VOID &&
        order.status !== ORDER_STATUS.COMPLETED
      );
    });
  }, [orderList, wcod]);

  const uncollectedCODBill = useMemo(() => {
    return uncollectedCODOrders.length > 0
      ? uncollectedCODOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [uncollectedCODOrders]);

  const collectedCODOrders = useMemo(() => {
    const orders = [...orderList];

    if (wcod) {
      orders.push(...wcod.wcodOrders);
    }

    return orders.filter((order: Order) => {
      return (
        (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.user?.preference?.paymentType === wcodDay) &&
        order.status === ORDER_STATUS.COMPLETED
      );
    });
  }, [orderList, wcod]);

  const collectedCODBill = useMemo(() => {
    return collectedCODOrders.length > 0
      ? collectedCODOrders.reduce((acc: number, order: Order) => {
          return acc + order.totalPrice;
        }, 0)
      : 0;
  }, [collectedCODOrders]);

  const codOrders = useMemo(() => {
    const orders = orderList.filter((order: Order) => {
      return (
        (order?.user?.preference?.paymentType === PAYMENT_TYPE.COD ||
          order?.user?.preference?.paymentType === wcodDay) &&
        order.status !== ORDER_STATUS.VOID
      );
    });

    if (!wcod) {
      return orders;
    }

    return [...orders, ...wcod.wcodOrders];
  }, [orderList, wcod]);

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
