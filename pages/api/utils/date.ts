import { Order } from '@/app/admin/orders/page';

export const convertDeliveryDateStringToDate = (deliveryDate: string) => {
  const parts = deliveryDate.split('/');
  const month = parseInt(parts[0], 10) - 1; // Months are 0-indexed in JavaScript, so subtract 1
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const orderDeliveryDate = new Date(year, month, day);

  return orderDeliveryDate;
};

export const filterDateRangeOrders = (
  orders: Order[] | any,
  startDate: Date,
  endDate: Date,
): Order[] => {
  const filteredDateRangeOrders = orders.filter((order: Order): any => {
    const orderDeliveryDate = convertDeliveryDateStringToDate(
      order.deliveryDate,
    );

    return orderDeliveryDate >= startDate && orderDeliveryDate <= endDate;
  });

  const sortedOrders = sortByDeliveryDate(filteredDateRangeOrders);

  return sortedOrders;
};

export const sortByDeliveryDate = (orders: Order[]): any => {
  const sortedOrders = orders.sort((orderA, orderB) => {
    const deliveryDateA: any = convertDeliveryDateStringToDate(
      orderA.deliveryDate,
    );
    const deliveryDateB: any = convertDeliveryDateStringToDate(
      orderB.deliveryDate,
    );

    return deliveryDateA - deliveryDateB;
  });

  return sortedOrders;
};

export const getSameDateLastWeek = (currentDate: string | Date) => {
  const sameDateLastWeek: Date = new Date(currentDate);

  // Subtract 7 days
  sameDateLastWeek.setDate(sameDateLastWeek.getDate() - 7);
  return sameDateLastWeek;
};

export const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};
