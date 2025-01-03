import { Order } from '@/app/admin/orders/page';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { Expense } from '@prisma/client';

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

export const sortByDeliveryDate = (
  orders: any[],
  field: string = 'deliveryDate',
): any => {
  const sortedOrders = orders.sort((orderA, orderB) => {
    const deliveryDateA: any = convertDeliveryDateStringToDate(orderA[field]);
    const deliveryDateB: any = convertDeliveryDateStringToDate(orderB[field]);

    return deliveryDateA - deliveryDateB;
  });

  return sortedOrders;
};

export const sortExpenseByDate = (expenses: Expense[]): any => {
  const sortedExpense = expenses.sort((expenseA, expenseB) => {
    const dateA: any = convertDeliveryDateStringToDate(expenseA.date);
    const dateB: any = convertDeliveryDateStringToDate(expenseB.date);

    return dateB - dateA;
  });

  return sortedExpense;
};

export const getSameDateLastWeek = (currentDate: string | Date) => {
  const sameDateLastWeek: Date = new Date(currentDate);

  // Subtract 7 days
  sameDateLastWeek.setDate(sameDateLastWeek.getDate() - 7);
  return sameDateLastWeek;
};

export const normalizeDate = (date: Date | string) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const generate7DaysBefore = (deliveryDate: string) => {
  const currentDate = new Date(deliveryDate);
  const endDate = new Date(deliveryDate);

  currentDate.setDate(currentDate.getDate() - 6);

  // Because the current date bill is already add in total price, so do not push it into array
  const dayList = [];

  while (currentDate < endDate) {
    const currentDateString = YYYYMMDDFormat(currentDate);
    dayList.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dayList;
};
