import React, { useState } from 'react';
import { FormControl } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time'; // Assuming this utility exists
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const useSelectDate = (providedDate?: string, fullWidth?: boolean) => {
  const [date, setDate] = useState(providedDate || generateRecommendDate());

  const handleDateChange = (e: any): void => {
    const formattedDate: string = formatDateChanged(e);

    setDate(formattedDate);
  };

  const SelectDate = (
    <FormControl fullWidth={fullWidth}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Date Filter"
          value={dayjs(date)}
          onChange={(e: any) => handleDateChange(e)}
          sx={{
            borderRadius: 2,
          }}
        />
      </LocalizationProvider>
    </FormControl>
  );

  return { date, SelectDate, setDate } as {
    date: string;
    setDate: any;
    SelectDate: JSX.Element;
  };
};

export default useSelectDate;
