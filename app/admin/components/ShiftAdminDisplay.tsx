import { IShiftSession } from '@/app/utils/type';
import { Box, Divider, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

interface IProps {
  shift: IShiftSession;
}

export default function ShiftAdminDisplay({ shift }: IProps) {
  const time: any = useMemo(() => {
    if (!shift) {
      return 0;
    }

    const startTime =
      shift.startedAt.split('  ')[1].split(' ')[0] +
      ' ' +
      shift.startedAt.split('  ')[1].split(' ')[1];
    const endTime =
      shift?.endedAt?.split('  ')[1].split(' ')[0] +
      ' ' +
      shift?.endedAt?.split('  ')[1].split(' ')[1];

    const finalEndTime = shift?.endedAt ? endTime : 'Ongoing';

    return {
      startTime,
      endTime: finalEndTime,
      display: startTime + ' - ' + finalEndTime,
    };
  }, [shift]);

  // const displayDate = useMemo(() => {
  //   if (!shift) {
  //     return '';
  //   }

  //   const date = new Date(shift.date);
  //   const day = date.getDate();
  //   const dateString = `${date.toLocaleString('default', { weekday: 'short' })} ${date.toLocaleString('default', { month: 'short' })} ${day}`;

  //   return dateString;
  // }, [shift?.date]);
  return (
    <Grid container alignItems="stretch">
      <Grid item xs={6} md={8} display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" fontWeight="semibold">
          {shift?.driver?.name}
        </Typography>
        <Typography>{shift?.route?.name}</Typography>
        <Typography>{time?.display}</Typography>
      </Grid>

      <Grid item xs="auto" textAlign="right" alignSelf="right">
        <Divider orientation="vertical" sx={{ height: '100%', width: '1px' }} />
      </Grid>

      <Grid item xs={5} md={3}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" flexDirection="column">
            <Typography>Hours: 10h</Typography>
            <Typography>Hourly Rate: $17.75</Typography>
          </Box>
          <Divider />
          <Typography variant="h6">Total: $175.00</Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
