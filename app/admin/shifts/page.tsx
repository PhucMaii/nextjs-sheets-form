'use client';
import React, { Fragment, useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { ShadowSection } from '../reports/styled';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { IShiftSession } from '@/app/utils/type';
import ShiftAdminDisplay from '../components/ShiftAdminDisplay';
import { AddShift } from '../components/Modals/add/AddShift';

export default function ShiftPage() {
  const [isOpenAddShift, setIsOpenAddShift] = useState<boolean>(false);
  const [shifts, setShifts] = useState<IShiftSession[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number>(-1);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [drivers, setDrivers] = useState<any>([]);

  const { showNotification, NotificationComp } = useNotification();
  const [shiftSessions] = SWRFetchData(
    `${API_URL.ADMIN}/shifts?startDate=${selectedDateRange[0]}&endDate=${selectedDateRange[1]}`,
  );

  useEffect(() => {
    if (shiftSessions?.data) {
      initializeShifts();
    }
  }, [shiftSessions]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/drivers`);
      const data = response.data.data;

      setDrivers(data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showNotification('error', 'Error fetching drivers');
    }
  };

  const initializeShifts = () => {
    setShifts(shiftSessions?.data);
  };

  return (
    <Sidebar>
      <AddShift 
        open={isOpenAddShift}
        onClose={() => setIsOpenAddShift(false)}
        drivers={drivers}
      />
      {NotificationComp}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Shifts</Typography>
        <SelectDateRange
          dateRange={selectedDateRange}
          setDateRange={setSelectedDateRange}
        />
      </Box>

      <ShadowSection>
        <Typography>Select Driver</Typography>
        <Select
          fullWidth
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(+e.target.value)}
          sx={{ mt: 1 }}
        >
          <MenuItem value={-1}>All</MenuItem>
          {drivers.map((driver: any) => (
            <MenuItem value={driver.id} key={driver.id}>
              <Typography>{driver.name}</Typography>
            </MenuItem>
          ))}
        </Select>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography sx={{ my: 2 }}>All Shifts</Typography>
          <Button onClick={() => setIsOpenAddShift(true)} variant="contained">+ Create Shift</Button>
        </Box>

        {shifts.length > 0 &&
          shifts.map((shift: IShiftSession) => (
            <Fragment key={shift.id}>
              <ShiftAdminDisplay shift={shift} />
              <Divider sx={{ my: 2 }} />
            </Fragment>
          ))}
      </ShadowSection>
    </Sidebar>
  );
}
