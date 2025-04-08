'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { generateMonthRange } from '@/app/utils/time';
import SelectDateRange from '../components/Select/SelectDateRange';
import { ShadowSection } from '../reports/styled';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import { API_URL, SHIFT_STATUS } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { IShiftSession } from '@/app/utils/type';
import ShiftAdminDisplay from '../components/ShiftAdminDisplay';
import { AddShift } from '../components/Modals/add/AddShift';
import EditShift from '../components/Modals/edit/EditShift';
import { blue, grey } from '@mui/material/colors';
import { groupBy } from '@/app/utils/array';
import OverviewCard from '../components/OverviewCard/OverviewCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ConfirmToPayShifts from '../components/Modals/ConfirmToPayShifts';
import PayrollCSV from '../components/CSV/PayrollCSV';

export default function ShiftPage() {
  const [drivers, setDrivers] = useState<any>([]);
  const [editShiftProps, setEditShiftProps] = useState<any>({
    open: false,
    shift: null,
  });
  const [confirmToPayProps, setConfirmToPayProps] = useState<any>({
    open: false,
  });
  const [isOpenAddShift, setIsOpenAddShift] = useState<boolean>(false);
  const [shifts, setShifts] = useState<Record<string, IShiftSession[]> | null>(
    null,
  );
  const [selectedDriverId, setSelectedDriverId] = useState<number>(-1);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(() =>
    generateMonthRange(),
  );
  const [selectedShifts, setSelectedShifts] = useState<IShiftSession[]>([]);

  const { showNotification, NotificationComp } = useNotification();
  const [shiftSessions] = SWRFetchData(
    `${API_URL.ADMIN}/shifts?startDate=${selectedDateRange[0]}&endDate=${selectedDateRange[1]}&driverId=${selectedDriverId}`,
  );

  const driverDataReport = useMemo(() => {
    if (selectedShifts.length === 0 && !shiftSessions?.data) {
      return [];
    }

    const toCalculateShifts = selectedShifts.length > 0 ? selectedShifts : shiftSessions?.data;

    const unpaidShifts = toCalculateShifts?.filter(
      (shift: any) => shift.status === SHIFT_STATUS.PAID,
    );

    return unpaidShifts.reduce((acc: any, shift: any) => {
      const existedDriver = acc.find(
        (driver: any) => driver.id === shift.driverId,
      );

      if (existedDriver) {
        existedDriver.hours += shift.hours;
        existedDriver.shifts++;
        existedDriver.total += shift.cost;
      } else {
        acc.push({
          id: shift.driverId,
          name: shift.driver.name,
          hours: shift.hours,
          shifts: 1,
          hourlyRate: shift.driver.hourlyRate,
          total: shift.cost,
        });
      }

      return acc;
    }, []);
  }, [selectedShifts, shiftSessions]);

  const totalShifts = useMemo(() => {
    if (!shiftSessions?.data) {
      return 0;
    }
    return shiftSessions?.data?.length || 0;
  }, [shiftSessions]);

  const totalHours = useMemo(() => {
    if (!shiftSessions?.data) {
      return 0;
    }
    return shiftSessions?.data?.reduce((acc: number, shift: any) => {
      return acc + shift.hours;
    }, 0);
  }, [shiftSessions]);

  const totalCosts = useMemo(() => {
    if (!shiftSessions?.data) {
      return 0;
    }
    return shiftSessions?.data?.reduce((acc: number, shift: any) => {
      return acc + shift.cost;
    }, 0);
  }, [shiftSessions]);

  const totalDriverIds = useMemo(() => {
    if (!shiftSessions?.data) {
      return [];
    }

    return shiftSessions?.data?.reduce((acc: number[], shift: any) => {
      if (!acc.includes(shift.driverId)) {
        acc.push(shift.driverId);
      }

      return acc;
    }, []);
  }, [shiftSessions]);

  const sortedDates = useMemo(() => {
    if (!shifts) {
      return [];
    }
    return Object.keys(shifts).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [shifts]);

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
    const shiftsByDate = groupBy(
      shiftSessions.data,
      (shift: any) => shift.date,
    );
    setShifts(shiftsByDate);
  };

  const onSelectAll = () => {
    if (shiftSessions?.data) {
      if (selectedShifts.length === shiftSessions.data.length) {
        setSelectedShifts([]);
      } else {
        setSelectedShifts(shiftSessions.data);
      }
    }
  };

  const onSelectShift = (shift: IShiftSession) => {
    const isExists = selectedShifts.find(
      (sShift: IShiftSession) => shift.id === sShift.id,
    );
    if (isExists) {
      setSelectedShifts(
        selectedShifts.filter(
          (sShift: IShiftSession) => sShift.id !== shift.id,
        ),
      );
    } else {
      setSelectedShifts([...selectedShifts, shift]);
    }
  };

  const onOpenEditShift = (shift: IShiftSession) => {
    setEditShiftProps({ open: true, shift });
  };

  return (
    <Sidebar>
      {confirmToPayProps.open && (
        <ConfirmToPayShifts
          showNotification={showNotification}
          open={confirmToPayProps.open}
          onClose={() => setConfirmToPayProps({ open: false })}
          shifts={selectedShifts}
          onClearSelectedShifts={() => setSelectedShifts([])}
        />
      )}
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={3}>
            <OverviewCard
              text="Shifts"
              value={totalShifts}
              icon={
                <CalendarMonthIcon
                  color="primary"
                  fontSize="large"
                  sx={{ fontSize: '3rem' }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <OverviewCard
              text="Total Hours"
              value={totalHours?.toFixed(2)}
              icon={
                <AccessTimeIcon
                  color="primary"
                  fontSize="large"
                  sx={{ fontSize: '3rem' }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <OverviewCard
              text="Total Cost"
              value={totalCosts?.toFixed(2)}
              icon={
                <AttachMoneyIcon
                  color="primary"
                  fontSize="large"
                  sx={{ fontSize: '3rem' }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <OverviewCard
              text="Total Drivers"
              value={totalDriverIds?.length}
              icon={
                <PermContactCalendarIcon
                  color="primary"
                  fontSize="large"
                  sx={{ fontSize: '3rem' }}
                />
              }
            />
          </Grid>
        </Grid>
        <Typography sx={{ mt: 2 }}>Select Driver</Typography>
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

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={() => setConfirmToPayProps({ open: true })}
              disabled={selectedShifts.length === 0}
              variant="outlined"
            >
              Approve & Pay
            </Button>
            <PayrollCSV driverData={driverDataReport} />
            <Button onClick={() => setIsOpenAddShift(true)} variant="contained" size="small">
              + Create Shift
            </Button>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedShifts.length === shiftSessions?.data.length}
                onChange={onSelectAll}
              />
            }
            sx={{width: 'fit-content'}}
            label="All"
          />
          {sortedDates.length > 0 &&
            shifts &&
            sortedDates.map((date: string) => {
              return (
                <Box key={date} display="flex" flexDirection="column">
                  <Typography variant="subtitle1">{date}</Typography>
                  {shifts[date].map((shift: IShiftSession) => {
                    const isSelected = selectedShifts.some(
                      (sShift: IShiftSession) => sShift.id === shift.id,
                    );
                    return (
                      <Box
                        sx={{
                          '&:hover': {
                            cursor: 'pointer',
                            backgroundColor: grey[200],
                          },
                          borderRadius: '8px',
                          backgroundColor: isSelected ? blue[50] : '',
                          pt: 2,
                        }}
                        onClick={() => onOpenEditShift(shift)}
                        key={shift.id}
                        display="flex"
                        flexDirection="column"
                        gap={1}
                      >
                        <ShiftAdminDisplay
                          shift={shift}
                          isSelected={isSelected}
                          onSelect={() => onSelectShift(shift)}
                        />
                        <Divider />
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
}
