import { Button, Dialog, DialogContent } from '@mui/material';
import React, { useState } from 'react';
import Calendar from 'react-calendar';

import 'react-calendar/dist/Calendar.css';
 

export default function SelectDateRange() {
    const [dateRange, setDateRange] = useState<any>([]);
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [isDateFullySelected, setIsDateFullySelected] = useState<boolean>(false);
    console.log(dateRange, 'dateRange');

    const handleDateOpen = () => {
        setShowDatePicker(true);
    }

    const handleDateClose = () => {
        setShowDatePicker(false);
    }

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
                <Button
                    variant="outlined"
                    onClick={handleDateOpen}
                >
                    Select Date Range
                </Button>
            )
        }

        return (
            <Button variant="outlined" onClick={handleDateOpen}>
                {
                    dateRange[0] &&
                    dateRange[1] && 
                    `${dateRange[0]?.toDateString()} - ${dateRange[1]?.toDateString()}`
                }
            </Button>
        )
    }
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
  )
}
