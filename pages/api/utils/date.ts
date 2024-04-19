import { Orders } from '@prisma/client';

export const filterDateRangeOrders = (
  orders: Orders[],
  startDate: string,
  endDate: string,
) => {
  const filteredDateRangeOrders = orders.filter((order: Orders) => {
    const parts = order.deliveryDate.split('/');
    const month = parseInt(parts[0], 10) - 1; // Months are 0-indexed in JavaScript, so subtract 1
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const orderDeliveryDate = new Date(year, month, day);

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    return (
      orderDeliveryDate >= formattedStartDate &&
      orderDeliveryDate <= formattedEndDate
    );
  });

  return filteredDateRangeOrders;
};
