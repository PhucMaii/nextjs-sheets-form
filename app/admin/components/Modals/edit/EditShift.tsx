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
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IDriver, IShiftSession } from '@/app/utils/type';
import { API_URL, WORKING_ROLE } from '@/app/utils/enum';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { groupBy } from '@/app/utils/array';
import { days } from '@/app/lib/constant';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import { RoleOption, roles } from '@/app/driver/components/Modals/ShiftModal';
import { formatDateString } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
  shift: IShiftSession;
  showNotification: ShowNotificationType;
}

export default function EditShift({
  open,
  onClose,
  shift,
  showNotification,
}: IProps) {
  const [allDrivers, setAllDrivers] = useState<IDriver[]>([]);
  const [allRoutes, setAllRoutes] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedShift, setUpdatedShift] = useState<IShiftSession | any>(shift);

  const todayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
  const sortedDays = [...days.slice(todayIndex), ...days.slice(0, todayIndex)];

  useEffect(() => {
    fetchAllRoutes();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (shift) {
      setUpdatedShift({
        ...shift,
        startedAt: shift.startedAt ? dayjs(shift.startedAt) : null,
        endedAt: shift.endedAt ? dayjs(shift.endedAt) : null,
      });
    }
  }, [shift]);

  const fetchAllRoutes = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/routes`);
      const data = groupBy(response.data.data, (route: any) => route.day);
      setAllRoutes(data);
    } catch (error: any) {
      console.error('Error fetching routes:', error);
      showNotification('error', 'Error fetching routes: ' + error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/drivers`);
      const data = response.data.data;
      setAllDrivers(data);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      showNotification('error', 'Error fetching drivers: ' + error);
    }
  };

  const handleUpdateShift = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/shifts`, {
        ...updatedShift,
        date: updatedShift.startedAt.format('MM/DD/YYYY'),
        startedAt: formatDateString(
          updatedShift.startedAt.format('YYYY-MM-DD HH:mm:ss'),
        ),
        endedAt: formatDateString(
          updatedShift.endedAt.format('YYYY-MM-DD HH:mm:ss'),
        ),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.error('Error updating shift:', error);
      showNotification('error', 'Error updating shift: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteShift = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/shifts?id=${updatedShift.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('Error deleting shift:', error);
      showNotification('error', 'Error deleting shift: ' + error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading={`Edit Shift`}
          buttonLabel="EDIT"
          onClick={handleUpdateShift}
          buttonProps={{ loading: isUpdating }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography>Select Driver</Typography>
            <Select
              fullWidth
              value={updatedShift?.driverId}
              onChange={(e) =>
                setUpdatedShift({ ...updatedShift, driverId: +e.target.value })
              }
              sx={{ mt: 1 }}
            >
              <MenuItem value={-1} disabled>
                -- Choose Driver --
              </MenuItem>
              {allDrivers.length > 0 &&
                allDrivers.map((driver: any) => (
                  <MenuItem value={driver.id} key={driver.id}>
                    <Typography>{driver.name}</Typography>
                  </MenuItem>
                ))}
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Typography>Role</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {roles.map((role: any) => (
                <RoleOption
                  key={role.role}
                  role={role.role}
                  icon={role.icon}
                  isSelected={updatedShift?.role === role.role}
                  onClick={() =>
                    setUpdatedShift({ ...updatedShift, role: role.role })
                  }
                />
              ))}
            </Box>
          </Grid>
          {updatedShift.role === WORKING_ROLE.DRIVER && (
            <Grid item xs={12}>
              <Typography>Route Assign</Typography>
              <Select
                fullWidth
                value={updatedShift?.routeId}
                onChange={(e) => {
                  setUpdatedShift({
                    ...updatedShift,
                    routeId: +e?.target?.value || -1,
                  });
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
                <MenuItem value={-1}>In Factory</MenuItem>
                {sortedDays.length > 0 &&
                  allRoutes &&
                  sortedDays.map((day: string) => [
                    <ListSubheader key={`subheader-${day}`}>
                      {day}
                    </ListSubheader>,
                    ...(allRoutes[day] || []).map((route: any) => (
                      <MenuItem key={route.id} value={route.id}>
                        <Typography>{route.name}</Typography>
                      </MenuItem>
                    )),
                  ])}
              </Select>
            </Grid>
          )}
          <Grid item xs={6}>
            <Typography>Start Time</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={updatedShift?.startedAt}
                onChange={(value) =>
                  setUpdatedShift({ ...updatedShift, startedAt: value })
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
                value={updatedShift?.endedAt}
                onChange={(value) =>
                  setUpdatedShift({ ...updatedShift, endedAt: value })
                }
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <LoadingButton
          loading={isDeleting}
          onClick={handleDeleteShift}
          variant="outlined"
          sx={{ mt: 4 }}
          color="error"
          fullWidth
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Trash2Icon />
            <Typography>Delete Shift</Typography>
          </Box>
        </LoadingButton>
      </BoxModal>
    </Modal>
  );
}
