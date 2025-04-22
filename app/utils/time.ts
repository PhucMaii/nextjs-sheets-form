import dayjs, { Dayjs } from 'dayjs';
import { days, limitOrderHour, months } from '../lib/constant';
import moment from 'moment';
import { PAYMENT_TYPE } from './enum';

export const YYYYMMDDFormat = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${month.toString().padStart(2, '0')}/${day
    .toString()
    .padStart(2, '0')}/${year.toString().padStart(2, '0')}`;

  return formattedDate;
};

export const formatDateChanged = (e: any): string => {
  const dateObj = new Date(e.$d);

  const formattedDate = YYYYMMDDFormat(dateObj);

  return formattedDate;
};

export const generateCurrentTime = () => {
  const currentDate = new Date();
  const dateString = moment(currentDate).format('YYYY-MM-DD');
  const timeString = moment(currentDate).format('HH:mm:ss');

  return `${timeString} ${dateString}`;
};

export const generateMinDate = () => {
  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  return minDate;
};

export const generateRecommendDate = (limitHour: number = limitOrderHour) => {
  // format initial date
  const dateObj = new Date();
  // if current hour is greater limit hour, then recommend the next day
  if (
    dateObj.getHours() >= limitHour ||
    (dateObj.getMonth() === 11 && dateObj.getDate() === 25) || // December 25th
    (dateObj.getMonth() === 0 && dateObj.getDate() === 1) // January 1st
  ) {
    dateObj.setDate(dateObj.getDate() + 1);
  }

  if (
    (dateObj.getMonth() === 11 && dateObj.getDate() === 25) || // December 25th
    (dateObj.getMonth() === 0 && dateObj.getDate() === 1) // January 1st
  ) {
    dateObj.setDate(dateObj.getDate() + 1);
  }

  const formattedDate = YYYYMMDDFormat(dateObj);
  return formattedDate;
};

export const generateMonthRange = () => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  const firstDayOfThisMonth = new Date(year, month, 1);
  const firstDayOfNextMonth = new Date(year, month + 1, 1);
  const lastDayOfThisMonth = new Date(firstDayOfNextMonth);
  lastDayOfThisMonth.setDate(0);
  lastDayOfThisMonth.setHours(23, 59, 59);

  return [firstDayOfThisMonth, lastDayOfThisMonth];
};

export const generateListOfDateString = (
  startDate: Date,
  endDate: Date,
  isAddUpEndDate = false,
) => {
  const formattedStartDate = startDate;
  const formattedEndDate = endDate;

  console.log({ startDate, endDate });

  // if (startDate.getTimezoneOffset() === 0 || endDate.getTimezoneOffset() === 0) {
  //   formattedStartDate = convertToPSTDate(startDate);
  //   formattedEndDate = convertToPSTDate(endDate);
  // }

  const startDateString = YYYYMMDDFormat(formattedStartDate);
  const dates = [startDateString];
  const currentDate = formattedStartDate;
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate.getTime() <= formattedEndDate.getTime()) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (isAddUpEndDate) {
    dates.push(YYYYMMDDFormat(formattedEndDate));
  }

  return dates;
};

export const getWCODDay = (date: string) => {
  const selectedDate = new Date(date);
  const dayIndex = selectedDate.getDay();

  const wcodDay = Object.values(PAYMENT_TYPE).find((paymentType: string) => {
    if (!paymentType.includes('WCOD')) {
      return false;
    }

    const day = paymentType.split(' - ')[1];
    return day === days[dayIndex];
  });

  return wcodDay;
};

export const getCreatedAt = () => {
  const currentDate = new Date();
  const dateString = moment(currentDate).format('YYYY-MM-DD');
  const timeString = moment(currentDate).format('HH:mm:ss');

  return `${timeString} ${dateString}`;
};

export const disableChristmasAndNewYear = (date: Dayjs) => {
  // Disable December 25th and January 1st
  return (
    (date.date() === 25 && date.month() === 11) || // December 25th
    (date.date() === 1 && date.month() === 0) // January 1st
  );
};

export const convertToMonthText = (month: number) => {
  return months[month];
};
