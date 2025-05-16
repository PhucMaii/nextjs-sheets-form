import {
  AlertColor,
  Box,
  Button,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IDriver } from '@/app/utils/type';
import axios from 'axios';
import { EMPLOYEE_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps {
  driver: IDriver;
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function EditDriver({
  driver,
  showNotification,
  mutateDrivers,
}: IProps) {
  const { companyId }: any = useParams();

  const [updatedDriver, setUpdatedDriver] = useState<IDriver>(driver);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);

  const handleEditDriver = async () => {
    try {
      setIsEditing(true);

      const response = await axios.put(getAdminApiUrl(companyId, '/drivers'), {
        driverId: driver.id,
        updatedName: updatedDriver.name,
        hourlyRate: updatedDriver.hourlyRate,
        employeeCode: updatedDriver.employeeCode,
        role: updatedDriver.role,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsEditing(false);
        return;
      }

      mutateDrivers();

      showNotification('success', response.data.message);
      setIsEditing(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        `There was an error ${error.response.data.error}`,
      );
      setIsEditing(false);
    }
  };
  return (
    <>
      <Button onClick={() => setIsOpenModal(true)}>Edit</Button>
      <Modal open={isOpenModal} onClose={() => setIsOpenModal(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Driver"
            buttonLabel="Save"
            onClick={handleEditDriver}
            onClose={() => setIsOpenModal(false)}
            buttonProps={{ loading: isEditing }}
          />
          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Name</Typography>
              <TextField
                value={updatedDriver.name}
                onChange={(e: any) =>
                  setUpdatedDriver({ ...updatedDriver, name: e.target.value })
                }
                // label="Name"
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Employee Code</Typography>
              <TextField
                value={updatedDriver.employeeCode}
                onChange={(e: any) =>
                  setUpdatedDriver({
                    ...updatedDriver,
                    employeeCode: e.target.value,
                  })
                }
                // label="Name"
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Role</Typography>
              <Select
                value={updatedDriver.role}
                onChange={(e: any) =>
                  setUpdatedDriver({ ...updatedDriver, role: e.target.value })
                }
              >
                {
                  Object.values(EMPLOYEE_ROLE).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))
                }
              </Select>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">Hourly Rate</Typography>
              <TextField
                value={updatedDriver.hourlyRate}
                onChange={(e: any) =>
                  setUpdatedDriver({
                    ...updatedDriver,
                    hourlyRate: +e.target.value,
                  })
                }
                // label="Name"
                type="number"
              />
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
