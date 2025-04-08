import StatusText from '@/app/admin/components/StatusText';
import { SHIFT_STATUS } from '@/app/utils/enum';
import { IShiftSession } from '@/app/utils/type';
import { Box, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useMemo } from 'react';

interface IProps {
  shift: IShiftSession;
}

export default function ShiftSummary({ shift }: IProps) {
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

    return {
      startTime,
      endTime: shift?.endedAt ? endTime : 'Ongoing',
    };
  }, [shift]);

  const displayDate = useMemo(() => {
    if (!shift) {
      return '';
    }

    const date = new Date(shift.date);
    const day = date.getDate();
    const dateString = `${date.toLocaleString('default', { weekday: 'short' })} ${date.toLocaleString('default', { month: 'short' })} ${day}`;

    return dateString;
  }, [shift?.date]);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box display="flex" flexDirection="column" gap={1}>
        <StatusText
          text={shift?.status || ''}
          type={shift?.status === SHIFT_STATUS.PAID ? 'success' : 'error'}
        />
        <Typography variant="h6">{displayDate}</Typography>
        <Typography variant="body2" sx={{ color: grey[700] }}>
          {shift?.route?.name || 'In Factory' }
        </Typography>
        <Typography variant="body2" sx={{ color: grey[700] }}>
          {time?.startTime} - {time?.endTime}
        </Typography>
      </Box>

      <Typography variant="h6">
        {shift?.hours !== null ? `${shift?.hours?.toFixed(2)}h` : 'N/A'}
      </Typography>
    </Box>
  );
}
