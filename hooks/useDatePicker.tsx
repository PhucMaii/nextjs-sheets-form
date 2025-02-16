import { limitOrderHour } from '@/app/lib/constant';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateRecommendDate,
} from '@/app/utils/time';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

const useDatePicker = (limitHour: number = limitOrderHour) => {
  const [deliveryDate, setDeliveryDate] = useState<string>(() =>
    generateRecommendDate(limitHour),
  );
  let today: any = dayjs();
  if (today.$H >= limitHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');

  const onDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDeliveryDate(formattedDate);
  };

  const renderDatePicker = () => {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          disablePast
          minDate={minDate}
          value={dayjs(deliveryDate)}
          onChange={onDateChange}
          sx={{ width: '100%' }}
          shouldDisableDate={disableChristmasAndNewYear}
        />
      </LocalizationProvider>
    );
  };

  return { minDate, onDateChange, deliveryDate, renderDatePicker };
};

export default useDatePicker;
