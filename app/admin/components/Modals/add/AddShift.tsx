// app/admin/components/Modals/add/AddShift.tsx
import {
  Box,
  Divider,
  Grid,
  ListSubheader,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { useEffect, useState } from 'react';
import { IDriver } from '@/app/utils/type';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL, WORKING_ROLE } from '@/app/utils/enum';
import { groupBy } from '@/app/utils/array';
import { days } from '@/app/lib/constant';
import { ShowNotificationType } from '@/hooks/useNotification';
import { RoleOption, roles } from '@/app/driver/components/Modals/ShiftModal';
import { formatDateString } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
  drivers: IDriver[];
  showNotification: ShowNotificationType;
}

export const AddShift = ({ open, onClose, drivers, showNotification }: IProps) => {
  const [allRoutes, setAllRoutes] = useState<any>(null);
  const [allDrivers, setAllDrivers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newShift, setNewShift] = useState<any>({
    driverId: -1,
    startedAt: dayjs(new Date()),
    endedAt: dayjs(new Date()),
    date: '',
    hours: 0,
    cost: 0,
    routeId: -1,
  });
  const [selectedRole, setSelectedRole] = useState<WORKING_ROLE>(WORKING_ROLE.DRIVER);

  const todayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const sortedDays = [...days.slice(todayIndex), ...days.slice(0, todayIndex)];

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(`${API_URL.ADMIN}/routes`);
        const data = groupBy(response.data.data, (route: any) => route.day);
        setAllRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (drivers) {
      setAllDrivers(drivers);
    }
  }, [drivers]);

  useEffect(() => {
    if (newShift.startedAt) {
      setNewShift((prevShift: any) => ({
        ...prevShift,
        date: newShift.startedAt.format('MM/DD/YYYY'),
      }));
    }
  }, [newShift.startedAt]);

  const handleAddShift = async () => {
    if (newShift.driverId === -1) {
      showNotification('error', 'Please select a driver');
      return;
    }

    if (newShift.startedAt.isAfter(newShift.endedAt)) {
      showNotification('error', 'Start time must be before end time');
      return;
    }

    if (selectedRole === WORKING_ROLE.DRIVER && newShift.routeId === -1) {
      showNotification('error', 'Please select a route for the driver');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.ADMIN}/shifts`, {
        ...newShift,
        startedAt: formatDateString(newShift.startedAt.format('YYYY-MM-DD HH:mm:ss')),
        endedAt: formatDateString(newShift.endedAt.format('YYYY-MM-DD HH:mm:ss')),
        role: selectedRole,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setNewShift({
        driverId: -1,
        startedAt: dayjs(new Date()),
        endedAt: dayjs(new Date()),
        date: '',
        hours: 0,
        cost: 0,
        routeId: -1,
      });
      onClose();
    } catch (error: any) {
      console.error('Error adding shift:', error);
      showNotification('error', 'Error adding shift');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight={'80vh'} overflow={'scroll'}>
        <ModalHead
          heading="Add Shift"
          buttonLabel="ADD"
          onClose={onClose}
          onClick={handleAddShift}
          buttonProps={{loading: isLoading}}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Select Driver</Typography>
            <Select
              fullWidth
              value={newShift.driverId}
              onChange={(e) => setNewShift({...newShift, driverId: +e.target.value})}
              sx={{ mt: 1 }}
            >
              <MenuItem value={-1} disabled>
                -- Choose Driver --
              </MenuItem>
              {allDrivers.map((driver: any) => (
                <MenuItem value={driver.id} key={driver.id}>
                  <Typography>{driver.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Typography>Role</Typography>
            <Box display="flex" gap={1} alignItems="center">
              {
                roles.map((role: any) => (
                  <RoleOption 
                    key={role.role}
                    role={role.role}
                    icon={role.icon}
                    isSelected={selectedRole === role.role}
                    onClick={() => setSelectedRole(role.role)}
                  />
                ))
              }

            </Box>
          </Grid>

          {selectedRole === WORKING_ROLE.DRIVER && <Grid item xs={12}>
            <Typography>Route Assign</Typography>
            <Select
              fullWidth
              value={newShift.routeId}
              onChange={(e) => {
                console.log('Selected Route ID:', +e.target.value);
                setNewShift({ ...newShift, routeId: +e.target.value });
              }}
              sx={{ mt: 1 }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                  },
                },
              }}
            >
              {sortedDays.length > 0 && allRoutes &&
                sortedDays.map((day: string) => [
                  <ListSubheader key={`subheader-${day}`}>{day}</ListSubheader>,
                  ...allRoutes[day].map((route: any) => (
                    <MenuItem key={route.id} value={route.id}>
                      <Typography>{route.name}</Typography>
                    </MenuItem>
                  )),
                ])}
            </Select>
          </Grid>}

          <Grid item xs={6}>
            <Typography>Start Time</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={newShift.startedAt}
                onChange={(value) =>
                  setNewShift({ ...newShift, startedAt: value })
                }
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6}>
            <Typography>End Time</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                sx={{ width: '100%' }}
                value={newShift.endedAt}
                onChange={(value) =>
                  setNewShift({ ...newShift, endedAt: value })
                }
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
};
