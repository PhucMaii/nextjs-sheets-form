import { AlertColor, Box, Button, Modal, Typography } from '@mui/material';
import React, { useContext, useState } from 'react';
import { BoxModal } from '../styled';
import { errorColor } from '@/theme/color';
import { grey } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import ErrorIcon from '@mui/icons-material/Error';
import { IDriver } from '@/app/utils/type';
import axios from 'axios';
import { EMPLOYEE_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { UserContext } from '@/app/context/UserContextAPI';
import { useRouter } from 'next/navigation';

interface IProps {
  driver: IDriver;
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function DeleteDriver({
  driver,
  showNotification,
  mutateDrivers,
}: IProps) {
  const { user }: any = useContext(UserContext);
  const { companyId }: any = useParams();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  
  const handleDeleteDriver = async () => {
    if (user?.role !== EMPLOYEE_ROLE.SUPER_ADMIN) {
      showNotification('error', 'You are not authorized to delete a driver');
      return;
    }
    try {
      setIsDeleting(true);
      const response = await axios.put(
        `${getAdminApiUrl(companyId, `/drivers/delete?driverId=${driver.id}`)}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsDeleting(false);
        return;
      }

      mutateDrivers();
      router.push(`/admin/${companyId}/employees`);
      showNotification('success', response.data.message);
      setIsDeleting(false);
    } catch (error: any) {
      console.log('There was an error', error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        color="error"
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        DELETE
      </Button>
      <Modal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <BoxModal
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <ErrorIcon sx={{ color: errorColor, fontSize: 50 }} />
          <Typography variant="h6" sx={{ color: grey[600] }} fontWeight="bold">
            Are you sure to delete driver {driver.name} ?
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              color="error"
              loading={isDeleting}
              onClick={handleDeleteDriver}
              variant="contained"
            >
              DELETE
            </LoadingButton>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
