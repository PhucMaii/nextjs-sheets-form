import { Order } from '@/app/admin/orders/page';
import { limitOrderHour } from '@/app/lib/constant';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { Expense } from '@prisma/client';
import moment from 'moment-timezone';

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
  // console.log(date, 'date');
  // const parsedDate = new Date(date);

  // console.log(parsedDate, 'parsed date');
  // return moment
  //   .utc(parsedDate)
  //   .tz('America/Los_Angeles')
  //   .startOf('day')
  //   .toDate();
  console.log('Input Date:', date);
  let parsedDate;

  if (date instanceof Date) {
    parsedDate = moment(date);
  } else if (typeof date === 'string') {
    const possibleFormats = [
      'MM/DD/YYYY', // e.g., 01/26/2025
      'YYYY-MM-DD', // e.g., 2025-01-26
      'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ', // e.g., Sat Feb 01 2025 00:00:00 GMT-0800
      'MM/DD/YYYY HH:mm:ss', // e.g., 01/26/2025 12:34:56
      'YYYY-MM-DDTHH:mm:ssZ', // ISO 8601 format
      moment.ISO_8601, // Fallback for any valid ISO 8601 string
    ];

    // Try parsing with each format
    for (const format of possibleFormats) {
      parsedDate = moment(date, format, true); // true = strict parsing
      if (parsedDate.isValid()) {
        break; // Stop if a valid date is found
      }
    }

    // Fallback to default parsing if no format matches
    if (!parsedDate || !parsedDate.isValid()) {
      parsedDate = moment(date);
    }
  } else {
    throw new Error('Invalid date format');
  }

  if (!parsedDate.isValid()) {
    throw new Error('Invalid date');
  }
  console.log('Parsed Date (Local):', parsedDate);
  console.log('Parsed Date (UTC):', parsedDate.toISOString());

  const normalizedDate = parsedDate
    .tz('America/Los_Angeles', true)
    .startOf('day')
    .toDate();

  console.log('Normalized Date:', normalizedDate);
  console.log('Normalized Date (UTC):', normalizedDate.toISOString());
  return normalizedDate;
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

  return { date: `${month}/${day}/20${year}`, time: pstDate.split(',')[1] };
};

export const checkOrderDeliveryDateValid = (deliveryDate: string) => {
  const selectedDate = normalizeDate(deliveryDate);
  const today = getTodayDate();
  const currentDate = new Date(today.date);
  console.log(currentDate.getHours());

  console.log({
    selectedDate,
    currentDate,
    compare: selectedDate.getTime() === currentDate.getTime(),
    today,
  });

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
