import { Box, Grid, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import React, { useState } from 'react';

export default function GeneratePayroll() {
  const [newPayroll, setNewPayroll] = useState<any>({
    startDate: dayjs(new Date()),
    endDate: dayjs(new Date()),
  });
  return (
    <Box>
      <Typography variant="h6" fontWeight={500}>
        Generate Payroll From Schedule
      </Typography>

      <Grid container spacing={2} mt={2}>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>Start Time</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              value={newPayroll.startDate}
              onChange={(value) => {
                setNewPayroll({ ...newPayroll, startDate: value });
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>End Time</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              value={newPayroll.endDate}
              onChange={(value) => {
                setNewPayroll({ ...newPayroll, endDate: value });
              }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
}
