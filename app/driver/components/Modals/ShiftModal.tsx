/* eslint-disable @typescript-eslint/no-unused-vars */
import { BoxModal } from '@/app/admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import React, { memo, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL, WORKING_ROLE } from '@/app/utils/enum';
import { LoadingButton } from '@mui/lab';
import { AccessTime } from '@mui/icons-material';
import { IShiftSession } from '@/app/utils/type';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import { getTodayDate } from '@/pages/api/utils/date';
import { grey } from '@mui/material/colors';
import { primaryColor } from '@/theme/color';
import useLocalStorage from '@/hooks/useLocalStorage';

export enum ShiftType {
  CLOCK_IN = 'CLOCK_IN',
  CLOCK_OUT = 'CLOCK_OUT',
}

export const roles = [
  {
    role: WORKING_ROLE.DRIVER,
    icon: <LocalShippingIcon />,
  },
  {
    role: WORKING_ROLE.IN_FACTORY,
    icon: <FactoryIcon />,
  },
];

export const RoleOption = ({
  role,
  icon,
  isSelected,
  onClick,
}: {
  role: WORKING_ROLE;
  icon: any;
  isSelected: boolean;
  onClick: any;
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        cursor: 'pointer',
        backgroundColor: grey[50],
        borderRadius: 2,
        width: '100px',
        height: '100px',
        border: isSelected ? `2px solid ${primaryColor}` : 'none',
      }}
      onClick={onClick}
    >
      {icon}
      <Typography fontWeight="semibold" sx={{ mt: 1 }}>
        {role}
      </Typography>
    </Box>
  );
};

interface IProps extends ModalProps {
  type: ShiftType;
  shift: IShiftSession | null;
  isDisabledClose: boolean;
}

const ShiftModal = ({
  open,
  onClose,
  type,
  shift,
  isDisabledClose,
}: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<WORKING_ROLE>(
    WORKING_ROLE.DRIVER,
  );
  const { showNotification, NotificationComp } = useNotification();

  const [isAsked, setIsAsked] = useLocalStorage('isAskedClockIn', false);

  const today = getTodayDate();

  const handleClockIn = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.DRIVER}/shift`, {
        role: selectedRole,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsAsked(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!shift) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.DRIVER}/shift/clock-out`, {
        shiftId: shift?.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async () => {
    if (type === ShiftType.CLOCK_IN) {
      await handleClockIn();
    } else {
      await handleClockOut();
    }
  };

  return (
    <>
      {NotificationComp}
      <Modal
        open={open}
        onClose={() => {
          if (!isDisabledClose) {
            setIsAsked(true);
            onClose();
          }
        }}
      >
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          {!isDisabledClose && (
            <Box display="flex" width="100%" justifyContent="flex-end">
              <IconButton
                onClick={() => {
                  setIsAsked(true);
                  onClose();
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
          <Typography variant="h5">{today.time.slice(0, 12)}</Typography>

          {type === ShiftType.CLOCK_IN && (
            <Box
              display="flex"
              flexDirection="column"
              // alignItems="center"
              sx={{ my: 2 }}
              gap={1}
            >
              <Typography justifySelf={'start'} sx={{ justifyItems: 'start' }}>
                Working as:
              </Typography>
              <Box
                display={'flex'}
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                {roles.map((role, index) => {
                  const isSelected = selectedRole === role.role;
                  return (
                    <RoleOption
                      key={index}
                      role={role.role}
                      icon={role.icon}
                      isSelected={isSelected}
                      onClick={() => setSelectedRole(role.role)}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
          <Typography
            variant="subtitle1"
            fontWeight="semibold"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            {type === ShiftType.CLOCK_IN
              ? `⏰ Are you ready to clock in yet?`
              : `💪 Thank you for your effort today!`}
          </Typography>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            fullWidth
            onClick={onSubmit}
            sx={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              alignSelf: 'center',
              mt: 2,
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={0.5}
            >
              <AccessTime fontSize="medium" />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {type === ShiftType.CLOCK_IN ? 'Clock In' : 'End Shift'}
              </Typography>
            </Box>
          </LoadingButton>
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(ShiftModal, (prev, next) => {
  return (
    prev.open === next.open &&
    prev.type === next.type &&
    Object.is(prev.shift, next.shift)
  );
});
