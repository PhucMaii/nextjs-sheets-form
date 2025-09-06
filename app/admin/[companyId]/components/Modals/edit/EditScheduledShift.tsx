import { Box, Divider, Typography, Modal, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import { IScheduledShift } from '@/app/utils/type';
import { ShowNotificationType } from '@/hooks/useNotification';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { roles } from '@/app/driver/components/Modals/ShiftModal';
import { RoleOption } from '@/app/driver/components/Modals/ShiftModal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useEmployee from '@/hooks/select/useEmployee';
import { getRole } from '@/pages/api/utils/employee';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import { formatDateString } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
  shift: IScheduledShift;
  shifts: IScheduledShift[];
  showNotification: ShowNotificationType;
  refresh: (newShifts: IScheduledShift[]) => Promise<void>;
}

export default function EditScheduledShift({
  open,
  onClose,
  shift,
  shifts,
  showNotification,
  refresh,
}: IProps) {
  const { companyId }: any = useParams();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatedShift, setUpdatedShift] = useState<any | null>(null);

  const { renderEmployeeSearch } = useEmployee(
    getRole(shift?.employee?.role || '', shift?.employee?.name || ''),
  );

  useEffect(() => {
    if (shift) {
      setUpdatedShift({
        ...shift,
        startedAt: dayjs(shift.startedAt),
        endedAt: dayjs(shift.endedAt),
      });
    }
  }, [shift]);

  const handleDeleteShift = async () => {
    try {
      setIsDeleting(true);

      console.log(Number(shift.id), 'shift.id');
      if (Number(shift.id)) {
        const response = await axios.delete(
          getAdminApiUrl(companyId, `/scheduled-shifts?id=${shift.id}`),
        );

        if (response.data.error) {
          showNotification('error', response.data.error);
          return;
        }
      }

      const newShifts = shifts.filter((baseShift) => baseShift.id !== shift.id);
      await refresh(newShifts);
      showNotification('success', 'Shift deleted successfully');
      onClose();
    } catch (error) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateShift = async () => {
    try {
      setIsUpdating(true);
      const hours = dayjs(updatedShift?.endedAt).diff(
        dayjs(updatedShift?.startedAt),
        'hours',
        true,
      );

      if (updatedShift?.startedAt?.isAfter(updatedShift?.endedAt)) {
        showNotification('error', 'Start time must be before end time');
        return;
      }

      const response = await axios.put(
        getAdminApiUrl(companyId, '/scheduled-shifts'),
        {
          updatedShift: {
            ...updatedShift,
            hours: Math.round(hours * 100) / 100,
            startedAt: formatDateString(
              dayjs(updatedShift?.startedAt).format('YYYY-MM-DD HH:mm:ss'),
            ),
            endedAt: formatDateString(
              dayjs(updatedShift?.endedAt).format('YYYY-MM-DD HH:mm:ss'),
            ),
            date: new Date(updatedShift?.startedAt).toLocaleDateString(
              'en-US',
              {
                dateStyle: 'full',
              },
            ),
            queryDate: dayjs(updatedShift?.startedAt).format('MM/DD/YYYY'),
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      const updatedShiftData = response.data.data;

      const newShifts = shifts.map((baseShift) => {
        // if (baseShift.id === updatedShiftData.id) {
        //   return updatedShiftData;
        // }

        if (baseShift.id === shift.id) {
          return updatedShiftData;
        }

        return baseShift;
      });

      await refresh(newShifts);
      showNotification('success', response.data.message);
      onClose();
    } catch (error) {
      console.log('Internal Server Error: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead
          heading="Edit Scheduled Shift"
          buttonLabel="Save"
          onClick={handleUpdateShift}
          buttonProps={{
            loading: isUpdating,
          }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Employee</Typography>
            {renderEmployeeSearch()}
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Role</Typography>
            <Box display="flex" gap={1} alignItems="center">
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
          </Box>

          <Box display="flex" flexDirection="column" gap={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              onClick={() =>
                setUpdatedShift({
                  ...updatedShift,
                  isOff: !updatedShift?.isOff,
                })
              }
              sx={{
                border: '2px solid',
                borderColor: updatedShift?.isOff ? 'error.main' : 'divider',
                borderRadius: 2,
                backgroundColor: updatedShift?.isOff
                  ? 'error.light'
                  : 'background.paper',
                '&:hover': {
                  backgroundColor: updatedShift?.isOff
                    ? 'error.light'
                    : 'action.hover',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Box display="flex" flexDirection="column">
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  color={updatedShift?.isOff ? 'error.dark' : 'text.primary'}
                >
                  Day Off
                </Typography>
                <Typography
                  variant="body2"
                  color={updatedShift?.isOff ? 'error.main' : 'text.secondary'}
                >
                  Mark this shift as a day off
                </Typography>
              </Box>
              <Switch
                checked={updatedShift?.isOff || false}
                onChange={(e) =>
                  setUpdatedShift({
                    ...updatedShift,
                    isOff: e.target.checked,
                  })
                }
                color="error"
                size="medium"
              />
            </Box>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={2}
              sx={{
                border: '2px solid',
                borderColor: updatedShift?.isSkip ? 'warning.main' : 'divider',
                borderRadius: 2,
                backgroundColor: updatedShift?.isSkip
                  ? 'warning.light'
                  : 'background.paper',
                '&:hover': {
                  backgroundColor: updatedShift?.isSkip
                    ? 'warning.light'
                    : 'action.hover',
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() =>
                setUpdatedShift({
                  ...updatedShift,
                  isSkip: !updatedShift?.isSkip,
                })
              }
            >
              <Box display="flex" flexDirection="column">
                <Typography
                  variant="subtitle1"
                  fontWeight="medium"
                  color={updatedShift?.isSkip ? 'warning.dark' : 'text.primary'}
                >
                  Skip Copying
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    updatedShift?.isSkip ? 'warning.main' : 'text.secondary'
                  }
                >
                  Exclude this shift when copying to next week
                </Typography>
              </Box>
              <Switch
                checked={updatedShift?.isSkip || false}
                onChange={(e) =>
                  setUpdatedShift({
                    ...updatedShift,
                    isSkip: e.target.checked,
                  })
                }
                color="warning"
                size="medium"
              />
            </Box>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            <Box display="flex" flexDirection="column" gap={1} width="100%">
              <Typography>Start Time</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={updatedShift?.startedAt}
                  onChange={(value: any) =>
                    setUpdatedShift({ ...updatedShift, startedAt: value })
                  }
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Box>

            <Box display="flex" flexDirection="column" gap={1} width="100%">
              <Typography>End Time</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={updatedShift?.endedAt}
                  onChange={(value: any) =>
                    setUpdatedShift({ ...updatedShift, endedAt: value })
                  }
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          <LoadingButton
            loading={isDeleting}
            onClick={handleDeleteShift}
            variant="outlined"
            color="error"
            fullWidth
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Trash2Icon />
              Delete
            </Box>
          </LoadingButton>
        </Box>
      </BoxModal>
    </Modal>
  );
}
