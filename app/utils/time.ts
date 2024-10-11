import dayjs from 'dayjs';
import { days, limitOrderHour } from '../lib/constant';
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

export const generateRecommendDate = () => {
  // format initial date
  const dateObj = new Date();
  // if current hour is greater limit hour, then recommend the next day
  if (dateObj.getHours() >= limitOrderHour) {
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

  return [firstDayOfThisMonth, lastDayOfThisMonth];
};

export const generateListOfDateString = (startDate: Date, endDate: Date) => {
  const startDateString = YYYYMMDDFormat(startDate);
  const dates = [startDateString];
  const currentDate = startDate;
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= endDate) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates.slice(0, dates.length);
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
