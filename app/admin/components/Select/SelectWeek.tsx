import { Button, Dialog, DialogContent } from '@mui/material';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Calendar from 'react-calendar';
import { startOfWeek, endOfWeek, format } from 'date-fns';

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
        <Button variant={variant || 'outlined'} onClick={handleDateOpen}>
          Select Week
        </Button>
      );
    }

    // const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    // const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });

    return (
      <Button variant={variant || 'outlined'} onClick={handleDateOpen}>
        {`${format(selectedWeek[0], 'MMM d')} – ${format(selectedWeek[1], 'MMM d, yyyy')}`}
      </Button>
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
