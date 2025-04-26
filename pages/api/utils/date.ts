import { Order } from '@/app/admin/orders/page';
import { limitOrderHour } from '@/app/lib/constant';
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
  direction: string = 'asc',
): any => {
  const sortedOrders = orders.sort((orderA, orderB) => {
    const deliveryDateA: any = convertDeliveryDateStringToDate(orderA[field]);
    const deliveryDateB: any = convertDeliveryDateStringToDate(orderB[field]);

    return direction === 'asc'
      ? deliveryDateA - deliveryDateB
      : deliveryDateB - deliveryDateA;
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

export const getTodayDate = (
  dateStyle: 'short' | 'long' | 'full' | 'medium' | undefined = 'short',
  timeStyle: 'short' | 'long' = 'long',
) => {
  const pstDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle,
    timeStyle,
    // timeStyle,
  }).format(new Date());

  const date = pstDate.split(',')[0];
  const dateSplitted = date.split('/');

  const month = dateSplitted[0].padStart(2, '0');
  const day = dateSplitted[1].padStart(2, '0');
  const year = dateSplitted[2];

  const dateRes = `${month}/${day}/20${year}`;
  const time = pstDate.split(',')[1];

  return { date: dateRes, time, dateAndTime: `${dateRes} ${time}` };
};

export const formatDateString = (inputDate: Date | string) => {
  const dateString = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'short',
    timeStyle: 'long',
    // timeStyle,
  }).format(new Date(inputDate));

  const date = dateString.split(',')[0];
  const dateSplitted = date.split('/');

  const month = dateSplitted[0].padStart(2, '0');
  const day = dateSplitted[1].padStart(2, '0');
  const year = dateSplitted[2];

  const dateRes = `${month}/${day}/20${year}`;
  const time = dateString.split(',')[1];

  return `${dateRes} ${time}`;
};

export const checkOrderDeliveryDateValid = (deliveryDate: string) => {
  const selectedDate = normalizeDate(deliveryDate);
  const today = getTodayDate();
  const currentDate = new Date(today.date);
  // console.log(currentDate.getHours());

  // console.log({
  //   selectedDate,
  //   currentDate,
  //   compare: selectedDate.getTime() === currentDate.getTime(),
  //   today,
  // });

  if (selectedDate.getTime() < currentDate.getTime()) {
    return { ok: false, message: 'Cannot create order for past date' };
    // return res.status(400).json({
    //   error: 'Cannot create order for past date',
    // });
  }

  if (selectedDate.getTime() === currentDate.getTime()) {
    if (today.time.includes('PM')) {
      return { ok: false, message: 'Cannot create order for past date' };
    }

    if (
      Number(today.time.split(':')[0]) >= limitOrderHour &&
      Number(today.time.split(':')[0]) !== 12
    ) {
      return { ok: false, message: 'Cannot create order for past date' };
      // return res.status(400).json({
      //   error: 'Cannot create order for past date',
      // });
    }
  }

  return { ok: true };
};

export const convertToPSTDate = (date: string | Date) => {
  let utcTimestamp;
  if (date instanceof Date) {
    utcTimestamp = new Date(date.getTime());
  } else {
    utcTimestamp = new Date(date);
  }

  const pstDate = new Date(utcTimestamp.getTime() - 8 * 3600 * 1000);
  return pstDate;
};

export const formatDate = (date: string) => {
  const formattedEndDate = normalizeDate(
    `${date.split(' ')[1]} ${date.split(' ')[2]} ${date.split(' ')[3]}`,
  );

  return formattedEndDate;
};
