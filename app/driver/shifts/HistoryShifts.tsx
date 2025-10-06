import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { IShiftSession } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import OverviewCard from '@/app/admin/[companyId]/components/OverviewCard/OverviewCard';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { ShadowSection } from '@/app/admin/[companyId]/reports/styled';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShiftSummary from '../components/ShiftSummary';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '@/app/admin/[companyId]/components/Select/SelectDateRange';
import { PayrollType } from '@prisma/client';

export default function HistoryShifts() {
  const [dateRange, setDateRange] = useState<any>(() => generateMonthRange());
  const [shifts, setShifts] = useState<IShiftSession[]>([]);

  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchShifts();
  }, [dateRange]);

  const shiftOverview = useMemo(() => {
    if (shifts.length === 0) {
      return {
        totalHours: 0,
        estEarnings: 0,
      };
    }

    const totalHours = shifts?.reduce((acc: number, shift: any) => {
      return acc + shift.hours;
    }, 0);

    let estEarnings = 0;

    if (shifts[0]?.employee?.payrollType === PayrollType.hourly) {
      estEarnings = shifts?.reduce((acc: number, shift: any) => {
        return acc + shift.cost;
      }, 0);
    } else {
      estEarnings = shifts[0]?.employee?.payRate || 0;
    }

    return {
      totalHours: totalHours.toFixed(2),
      estEarnings: estEarnings.toFixed(2),
    };
  }, [shifts]);

  const fetchShifts = async () => {
    try {
      const response = await axios.get(
        `${API_URL.DRIVER}/shift?startDate=${dateRange[0]}&endDate=${dateRange[1]}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setShifts(response.data.data);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  return (
    <>
      {NotificationComp}
      <Box display="flex" flexDirection="column" gap={1} mt={1}>
        <Typography variant="h5">Shifts</Typography>
        <SelectDateRange dateRange={dateRange} setDateRange={setDateRange} />
      </Box>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <OverviewCard
            text="Shifts"
            value={shifts.length}
            icon={<AccessTimeIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Total Hours"
            value={shiftOverview?.totalHours}
            // icon={<AccessAlarmIcon fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={6}>
          <OverviewCard
            text="Est. Earnings ($)"
            value={shiftOverview?.estEarnings}
            // icon={<AttachMoneyIcon fontSize="large" color="primary" />}
          />
        </Grid>
      </Grid>

      <ShadowSection sx={{ mt: 2 }}>
        {shifts.length > 0 &&
          shifts.map((shift: IShiftSession, index: number) => (
            <Fragment key={index}>
              <ShiftSummary shift={shift} />
              <Divider sx={{ my: 2 }} />
            </Fragment>
          ))}
      </ShadowSection>
    </>
  );
}
