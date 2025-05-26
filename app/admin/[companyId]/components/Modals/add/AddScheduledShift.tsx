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
import { WORKING_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';

interface IProps extends ModalProps {
    defaultEmployee?: string;
    defaultDate?: string;
}

export default function AddScheduledShift({ open, onClose, defaultEmployee, defaultDate }: IProps) {
  const [newShift, setNewShift] = useState<any>({
    startedAt: defaultDate ? dayjs(defaultDate) : null,
    endedAt: defaultDate ? dayjs(defaultDate).add(1, 'hour') : null,
    employeeId: null,
    role: WORKING_ROLE.DRIVER,
  });

  console.log({defaultEmployee, defaultDate});

  const { selectedEmployee, renderEmployeeSearch } = useEmployee(defaultEmployee);

  useEffect(() => {
    if (defaultDate) {
      setNewShift({ ...newShift, startedAt: dayjs(defaultDate).hour(10), endedAt: dayjs(defaultDate).add(1, 'hour') });
    }
  }, [defaultDate]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Add Scheduled Shift"
          buttonLabel="Add"
          onClick={() => {}}
          buttonProps={{
            variant: 'contained',
            color: 'primary',
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
