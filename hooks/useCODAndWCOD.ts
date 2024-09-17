import { Order } from '@/app/admin/orders/page';
import { days } from '@/app/lib/constant';
import { API_URL, ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

// Current date is in MM/DD/YYYY format
const useCODAndWCOD = (orderList: Order[], selectedDate: string) => {
  const [wcod, setWcod] = useState<any>(null);

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
  }, [selectedDate, orderList]);

  useEffect(() => {
    if (orderList.length > 0 && wcodDay) {
      fetchWcodOrders();
    }
  }, [wcodDay]);

  const fetchWcodOrders = async () => {
    try {
      const clientIds = orderList.filter((order: Order) => {
        return order?.user?.preference?.paymentType === wcodDay
      }).map((order: Order) => order.userId);

      const response = await axios.get(
        `${API_URL.ADMIN}/wcod?clientIdList=${[...clientIds]}&date=${selectedDate}`,
      );

      if (response.data.error) {
        return;
      }

      setWcod(response.data.data);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
    }
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
