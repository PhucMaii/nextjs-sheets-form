import { Button, Dialog, DialogContent } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';

interface PropTypes {
  dateRange: any;
  setDateRange: Dispatch<SetStateAction<any>>;
}

export default function SelectDateRange({
  dateRange,
  setDateRange,
}: PropTypes) {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isDateFullySelected, setIsDateFullySelected] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      dateRange[0] &&
      dateRange[1] &&
      dateRange[0].toDateString() !== dateRange[1].toDateString()
    ) {
      setIsDateFullySelected(true);
    }
  }, [dateRange]);

  // Handle if user have selected both start date and end date
  useEffect(() => {
    if (isDateFullySelected) {
      setShowDatePicker(false);
      setIsDateFullySelected(false);
    }
  }, [isDateFullySelected]);

  const handleDateOpen = () => {
    setShowDatePicker(true);
  };

  const handleDateClose = () => {
    setShowDatePicker(false);
  };

  const handleOnChange = (ranges: any) => {
    if (ranges[0] && ranges[1]) {
      setDateRange(ranges);
    }
  };

  const renderDateRange = () => {
    if (
      !dateRange[0] ||
      !dateRange[1] ||
      dateRange[0].toDateString() === dateRange[1].toDateString()
    ) {
      return (
        <Button variant="outlined" onClick={handleDateOpen}>
          Select Date Range
        </Button>
      );
    }

    return (
      <Button variant="outlined" onClick={handleDateOpen}>
        {dateRange[0] &&
          dateRange[1] &&
          `${dateRange[0]?.toDateString()} - ${dateRange[1]?.toDateString()}`}
      </Button>
    );
  };
  return (
    <>
      {renderDateRange()}
      <Dialog open={showDatePicker} onClose={handleDateClose}>
        <DialogContent>
          <Calendar
            goToRangeStartOnSelect
            allowPartialRange
            selectRange
            onChange={(range) => handleOnChange(range)}
            value={dateRange}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
