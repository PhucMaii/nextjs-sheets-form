import { Box, Divider, Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import useEmployee from '@/hooks/select/useEmployee';
import { RoleOption, roles } from '@/app/driver/components/Modals/ShiftModal';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getAdminApiUrl, WORKING_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { ShowNotificationType } from '@/hooks/useNotification';
import { IScheduledShift } from '@/app/utils/type';
import { formatDateString } from '@/pages/api/utils/date';

interface IProps extends ModalProps {
  defaultEmployee?: string;
  defaultDate?: string;
  showNotification: ShowNotificationType;
  refresh: (newShifts: IScheduledShift[]) => Promise<void>;
  shifts: IScheduledShift[];
}

export default function AddScheduledShift({
  open,
  onClose,
  defaultEmployee,
  defaultDate,
  showNotification,
  refresh,
  shifts,
}: IProps) {
  const { companyId }: any = useParams();

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newShift, setNewShift] = useState<any>({
    startedAt: defaultDate ? dayjs(defaultDate).set('hour', 7) : null,
    endedAt: defaultDate ? dayjs(defaultDate).set('hour', 15) : null,
    employeeId: null,
    role: WORKING_ROLE.DRIVER,
  });

  const { renderEmployeeSearch, selectedEmployeeData } =
    useEmployee(defaultEmployee);

  useEffect(() => {
    if (defaultDate) {
      setNewShift({
        ...newShift,
        startedAt: dayjs(defaultDate).hour(7),
        endedAt: dayjs(defaultDate).hour(15),
      });
    }
  }, [defaultDate]);

  const handleAddScheduledShift = async () => {
    try {
      setIsAdding(true);

      if (!newShift.startedAt || !newShift.endedAt) {
        showNotification('error', 'Please select start and end time');
        return;
      }

      if (newShift.startedAt.isAfter(newShift.endedAt)) {
        showNotification('error', 'Start time must be before end time');
        return;
      }

      const minutes = newShift.endedAt.diff(newShift.startedAt, 'minutes');
      const hours = Math.round(minutes / 60 * 100) / 100;
      
      const response = await axios.post(
        getAdminApiUrl(companyId, '/scheduled-shifts'),
        {
          scheduledShift: {
            ...newShift,
            startedAt: formatDateString(
              newShift.startedAt.format('YYYY-MM-DD HH:mm:ss'),
            ),
            endedAt: formatDateString(
              newShift.endedAt.format('YYYY-MM-DD HH:mm:ss'),
            ),
            companyId: Number(companyId),
            employeeId: selectedEmployeeData.id,
            employee: selectedEmployeeData,
            date: new Date(newShift.startedAt).toLocaleDateString('en-US', {
              dateStyle: 'full',
            }),
            queryDate: newShift.startedAt.format('MM/DD/YYYY'),
            hours,
          },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      const newShifts = [...shifts, response.data.data];
      await refresh(newShifts);

      showNotification('success', response.data.message);
      onClose();
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Add Scheduled Shift"
          buttonLabel="Add"
          onClick={handleAddScheduledShift}
          buttonProps={{
            loading: isAdding,
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
                  isSelected={newShift.role === role.role}
                  onClick={() => setNewShift({ ...newShift, role: role.role })}
                />
              ))}
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
                  value={newShift.startedAt}
                  onChange={(value) =>
                    setNewShift({ ...newShift, startedAt: value })
                  }
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Box>

            <Box display="flex" flexDirection="column" gap={1} width="100%">
              <Typography>End Time</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={newShift.endedAt}
                  onChange={(value) =>
                    setNewShift({ ...newShift, endedAt: value })
                  }
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
