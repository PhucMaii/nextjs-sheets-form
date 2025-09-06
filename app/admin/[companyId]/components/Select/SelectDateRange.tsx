import { Box, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import 'react-calendar/dist/Calendar.css';
import { shiftMonth } from '@/pages/api/utils/date';

interface PropTypes {
  dateRange: any;
  setDateRange: Dispatch<SetStateAction<any>>;
  variant?: any;
  style?: any;
  navigation?: boolean;
}

export default function SelectDateRange({
  dateRange,
  setDateRange,
  variant,
  style,
  navigation,
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

  const handleNextMonth = () => {
    const newDateRange = shiftMonth(dateRange[0], 1);
    setDateRange(newDateRange);
  };

  const handlePreviousMonth = () => {
    const newDateRange = shiftMonth(dateRange[0], -1);
    setDateRange(newDateRange);
  };

  const renderDateRange = () => {
    if (
      !dateRange[0] ||
      !dateRange[1] ||
      dateRange[0].toDateString() === dateRange[1].toDateString()
    ) {
      return (
        <Button
          variant={variant ? variant : 'outlined'}
          onClick={handleDateOpen}
          sx={style}
        >
          Select Date Range 
        </Button>
      );
    }

    return (
      <Box>
        {navigation && (
          <IconButton onClick={handlePreviousMonth}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        )}
        <Button
          variant={variant ? variant : 'outlined'}
          onClick={handleDateOpen}
          sx={style}
        >
          {dateRange[0] &&
            dateRange[1] &&
            `${dateRange[0]?.toDateString()} - ${dateRange[1]?.toDateString()}`}
        </Button>
        {navigation && (
          <IconButton onClick={handleNextMonth}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
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
