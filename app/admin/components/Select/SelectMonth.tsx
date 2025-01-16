import { Button, Dialog, DialogContent } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';

interface PropTypes {
  selectedMonth: Date | null;
  setSelectedMonth: Dispatch<SetStateAction<Date | null>>;
  variant?: any;
}

export default function SelectMonth({
  selectedMonth,
  setSelectedMonth,
  variant,
}: PropTypes) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const handleDateOpen = () => {
    setShowDatePicker(true);
  };

  const handleDateClose = () => {
    setShowDatePicker(false);
  };

  const handleMonthSelect = (date: Date) => {
    setSelectedMonth(date);
    setShowDatePicker(false);
  };

  const renderSelectedMonth = () => {
    if (!selectedMonth) {
      return (
        <Button
          variant={variant ? variant : 'outlined'}
          onClick={handleDateOpen}
        >
          Select Month
        </Button>
      );
    }

    return (
      <Button variant={variant ? variant : 'outlined'} onClick={handleDateOpen}>
        {selectedMonth.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        })}
      </Button>
    );
  };

  return (
    <>
      {renderSelectedMonth()}
      <Dialog open={showDatePicker} onClose={handleDateClose}>
        <DialogContent>
          <Calendar
            view="year" // Show months
            onClickMonth={handleMonthSelect} // Handle month click
            value={selectedMonth || new Date()}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
