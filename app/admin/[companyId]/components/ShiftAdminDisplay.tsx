import { IShiftSession } from '@/app/utils/type';
import { Box, Checkbox, Divider, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import StatusText from './StatusText';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { SHIFT_STATUS } from '@/app/utils/enum';

interface IProps {
  shift: IShiftSession;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ShiftAdminDisplay({
  shift,
  isSelected,
  onSelect,
}: IProps) {
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

  return (
    <Grid container alignItems="stretch" spacing={1}>
      <Grid item xs={12}>
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          onClick={(e: any) => {
            e.stopPropagation();
          }}
        />
      </Grid>
      <Grid item xs={6} md={8} gap={1}>
        <Box
          display="flex"
          flexDirection="column"
          gap={0.5}
          justifyContent="center"
          height="100%"
        >
          <StatusText
            text={shift?.status || ''}
            type={shift?.status === SHIFT_STATUS.UNPAID ? 'error' : 'success'}
          />
          <Typography variant="h6" fontWeight="semibold">
            {shift?.employee?.name}
          </Typography>
          <Typography>
            {shift?.route?.name ? shift?.route?.name : shift?.role}
          </Typography>
          <Typography>{time?.display}</Typography>
        </Box>
      </Grid>

      <Grid item xs={0.1}>
        <Divider orientation="vertical" flexItem sx={{ height: '100%' }} />
      </Grid>

      <Grid item xs={5} md={3.8}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          gap={2}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography variant="h6" fontWeight="regular">
                Hours:{' '}
                {shift?.hours !== null ? shift.hours?.toFixed(2) : 'Ongoing'}
              </Typography>
              <Typography variant="h6" fontWeight="regular">
                Hourly Rate: ${shift?.employee?.hourlyRate}
              </Typography>
            </Box>
            {shift?.isActive && (
              <StatusText
                text="On Shift"
                type="success"
                icon={<AccessAlarmIcon fontSize="small" />}
              />
            )}
          </Box>
          <Divider />
          <Typography variant="h5">
            Total: ${shift?.cost?.toFixed(2) || 0}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}
