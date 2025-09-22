import dayjs, { Dayjs } from 'dayjs';
import { days, limitOrderHour, months } from '../lib/constant';
import moment from 'moment';
import { PAYMENT_TYPE } from './enum';
import { getTodayDate } from '@/pages/api/utils/date';

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
  let today: any = getTodayDate();
  today = dayjs(today.dateAndTime, "MM/DD/YYYY HH:mm:ss");
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  console.log(minDate, 'MIN DATE');
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

export const generateMonthRange = (
  startDate?: Date,
  monthOffset: number = 0,
) => {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Calculate the target month and year based on the offset
  const targetMonth = month + monthOffset;
  const targetYear = year + Math.floor(targetMonth / 12);
  const adjustedMonth = ((targetMonth % 12) + 12) % 12; // Handle negative months

  const firstDayOfThisMonth = startDate
    ? new Date(startDate)
    : new Date(targetYear, adjustedMonth, 1);
  const firstDayOfNextMonth = new Date(targetYear, adjustedMonth + 1, 1);
  const lastDayOfThisMonth = new Date(firstDayOfNextMonth);
  lastDayOfThisMonth.setDate(0);
  lastDayOfThisMonth.setHours(23, 59, 59);

  return [firstDayOfThisMonth, lastDayOfThisMonth];
};

export const generateWeekRange = () => {
  const today = new Date();
  const week = today.getDay(); // 0 (Sunday) - 6 (Saturday)

  const firstDayOfThisWeek = new Date(today);
  const diff = today.getDate() - week + (week === 0 ? -6 : 1); // adjust for Sunday
  firstDayOfThisWeek.setDate(diff);
  firstDayOfThisWeek.setHours(0, 0, 0);

  const lastDayOfThisWeek = new Date(firstDayOfThisWeek);
  lastDayOfThisWeek.setDate(firstDayOfThisWeek.getDate() + 6);
  lastDayOfThisWeek.setHours(23, 59, 59);

  return [firstDayOfThisWeek, lastDayOfThisWeek];
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

export const convertToDateStyleFull = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    dateStyle: 'full',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper: format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};
