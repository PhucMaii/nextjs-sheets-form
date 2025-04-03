'use client';
import React, { useEffect, useState } from 'react';
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
import EditShift from '../components/Modals/edit/EditShift';
import { grey } from '@mui/material/colors';

export default function ShiftPage() {
  const [isOpenAddShift, setIsOpenAddShift] = useState<boolean>(false);
  const [shifts, setShifts] = useState<IShiftSession[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number>(-1);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [drivers, setDrivers] = useState<any>([]);
  const [editShiftProps, setEditShiftProps] = useState<any>({
    open: false,
    shift: null,
  });

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

  const onOpenEditShift = (shift: IShiftSession) => {
    setEditShiftProps({ open: true, shift });
  };

  return (
    <Sidebar>
      {editShiftProps.shift && (
        <EditShift
          open={editShiftProps.open}
          onClose={() => setEditShiftProps({ open: false, shift: null })}
          shift={editShiftProps.shift}
          showNotification={showNotification}
        />
      )}
      <AddShift
        open={isOpenAddShift}
        onClose={() => setIsOpenAddShift(false)}
        drivers={drivers}
        showNotification={showNotification}
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
          <Button onClick={() => setIsOpenAddShift(true)} variant="contained">
            + Create Shift
          </Button>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {shifts.length > 0 &&
            shifts.map((shift: IShiftSession) => (
              <Box
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    backgroundColor: grey[200],
                  },
                  borderRadius: '8px',
                }}
                mt={2}
                onClick={() => onOpenEditShift(shift)}
                key={shift.id}
                display="flex"
                flexDirection="column"
              >
                <ShiftAdminDisplay shift={shift} />
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
