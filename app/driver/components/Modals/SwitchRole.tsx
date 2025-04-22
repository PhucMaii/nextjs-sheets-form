import { BoxModal } from '@/app/admin/components/Modals/styled';
import { Box, IconButton, Modal, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { memo, useState } from 'react';
import { getTodayDate } from '@/pages/api/utils/date';
import { RoleOption, roles } from './ShiftModal';
import { API_URL, WORKING_ROLE } from '@/app/utils/enum';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { LoadingButton } from '@mui/lab';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';

interface IProps extends ModalProps {}

const SwitchRole = ({ open, onClose }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<WORKING_ROLE>(
    WORKING_ROLE.DRIVER,
  );
  const today = getTodayDate();

  const { showNotification, NotificationComp } = useNotification();

  const onSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.DRIVER}/shift/switch-role`, {
        role: selectedRole,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {NotificationComp}
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box display="flex" width="100%" justifyContent="flex-end">
          <IconButton
            onClick={() => {
              onClose();
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="h5">{today.time.slice(0, 11)}</Typography>

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
            <TransferWithinAStationIcon fontSize="medium" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Switch
            </Typography>
          </Box>
        </LoadingButton>
      </BoxModal>
    </Modal>
    </>
  );
}

export default memo(SwitchRole, (prev, next) => {
  return prev.open === next.open;
});