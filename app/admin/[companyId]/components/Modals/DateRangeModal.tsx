import { Dialog, DialogContent } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
import { ModalProps } from './type';

interface IProps extends ModalProps {
  dateRange: any;
  setDateRange: Dispatch<SetStateAction<any>>;
}

export default function DateRange({
  open,
  onClose,
  dateRange,
  setDateRange,
}: IProps) {
  const [isDateFullySelected, setIsDateFullySelected] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      dateRange[0] &&
      dateRange[1] &&
      dateRange[0].toDateString() !== dateRange[1].toDateString()
    ) {
      setIsDateFullySelected(true);
      onClose();
    }
  }, [dateRange]);

  // Handle if user have selected both start date and end date
  useEffect(() => {
    if (isDateFullySelected) {
      //   setShowDatePicker(false);
      setIsDateFullySelected(false);
    }
  }, [isDateFullySelected]);

  const handleOnChange = (ranges: any) => {
    if (ranges[0] && ranges[1]) {
      setDateRange(ranges);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
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
  );
}
