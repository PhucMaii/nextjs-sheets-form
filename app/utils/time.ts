import dayjs from 'dayjs';
import { limitOrderHour } from '../lib/constant';

export const YYYYMMDDFormat = (date: Date) => {
  const month = date.getUTCMonth() + 1;
  const day = date.getDate();
  const year = date.getUTCFullYear();

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
  return [firstDayOfThisMonth, today];
};
