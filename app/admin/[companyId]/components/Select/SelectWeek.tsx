import { Box, Button, Dialog, DialogContent, IconButton } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Calendar from 'react-calendar';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import 'react-calendar/dist/Calendar.css';

interface PropTypes {
  selectedWeek: any;
  setSelectedWeek: Dispatch<SetStateAction<any>>;
  variant?: any;
  weekStart?: 0 | 1; // Sunday (0) or Monday (1)
}

export default function SelectWeek({
  selectedWeek,
  setSelectedWeek,
  variant,
}: PropTypes) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateOpen = () => setShowDatePicker(true);
  const handleDateClose = () => setShowDatePicker(false);

  const handlePreviousWeek = () => {
    const lastStartDate = new Date(selectedWeek[0]);
    lastStartDate.setDate(lastStartDate.getDate() - 7);

    const lastEndDate = new Date(selectedWeek[1]);
    lastEndDate.setDate(lastEndDate.getDate() - 7);

    setSelectedWeek([lastStartDate, lastEndDate]);
  };

  const handleNextWeek = () => {
    const nextStartDate = new Date(selectedWeek[0]);
    nextStartDate.setDate(nextStartDate.getDate() + 7);

    const nextEndDate = new Date(selectedWeek[1]);
    nextEndDate.setDate(nextEndDate.getDate() + 7);

    setSelectedWeek([nextStartDate, nextEndDate]);
  };

  const handleWeekSelect = (date: Date) => {
    setSelectedWeek([
      startOfWeek(date, { weekStartsOn: 1 }),
      endOfWeek(date, { weekStartsOn: 1 }),
    ]);
    setShowDatePicker(false);
  };

  const renderSelectedWeek = () => {
    if (!selectedWeek || selectedWeek.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Button variant={variant || 'outlined'} onClick={handleDateOpen}>
            Select Week
          </Button>
        </Box>
      );
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
        <IconButton onClick={handlePreviousWeek}>
          <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Button variant={variant || 'outlined'} onClick={handleDateOpen}>
          {`${format(selectedWeek[0], 'MMM d')} – ${format(selectedWeek[1], 'MMM d, yyyy')}`}
        </Button>
        <IconButton onClick={handleNextWeek}>
          <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    );
  };

  console.log(selectedWeek, 'selectedWeek');

  return (
    <>
      {renderSelectedWeek()}
      <Dialog open={showDatePicker} onClose={handleDateClose}>
        <DialogContent>
          <Calendar onClickDay={handleWeekSelect} value={selectedWeek} />
        </DialogContent>
      </Dialog>
    </>
  );
}
