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
      shift?.startedAt?.split('  ')[1]?.split(' ')[0] +
      ' ' +
      shift.startedAt?.split('  ')[1]?.split(' ')[1];
    const endTime =
      shift?.endedAt?.split('  ')[1]?.split(' ')[0] +
      ' ' +
      shift?.endedAt?.split('  ')[1]?.split(' ')[1];

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
    <Grid container alignItems="stretch" spacing={2}>
      <Grid item xs={6} md={8} gap={1}>
        <Box display="flex" flexDirection="column" gap={0.5} justifyContent="center" height="100%">
          <Typography variant="h6" fontWeight="semibold">
            {shift?.driver?.name}
          </Typography>
          <Typography>{shift?.route?.name ? `Driver - ${shift.route.name}` : 'In Factory'}</Typography>
          <Typography>{time?.display}</Typography>
        </Box>
      </Grid>

      <Grid item xs={0.1}>
        <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
      </Grid>

      <Grid item xs={5.9} md={3.9}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="h6" fontWeight="regular">
              Hours:{' '}
              {shift?.hours !== null ? shift.hours?.toFixed(2) : 'Ongoing'}
            </Typography>
            <Typography variant="h6" fontWeight="regular">
              Hourly Rate: ${shift?.driver?.hourlyRate}
            </Typography>
          </Box>
          <Divider />
          <Typography variant="h5">
            Total: ${shift?.cost?.toFixed(2)}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
