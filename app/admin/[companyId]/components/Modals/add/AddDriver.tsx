import {
  AlertColor,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import axios from 'axios';
import { EMPLOYEE_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function AddDriver({
  open,
  onClose,
  showNotification,
  mutateDrivers,
}: IProps) {
  const { companyId }: any = useParams();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  const handleAddDriver = async () => {
    try {
      setIsAdding(true);

      const response = await axios.post(getAdminApiUrl(companyId, '/drivers'), {
        driverName: name.toUpperCase(),
        driverPassword: password,
        hourlyRate,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      mutateDrivers();

      showNotification('success', response.data.message);
      setIsAdding(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        `There was an error ${error.response.data.error}`,
      );
      setIsAdding(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Driver"
          buttonLabel="Add"
          onClick={handleAddDriver}
          buttonProps={{ loading: isAdding }}
          onClose={onClose}
        />
        <Divider sx={{ my: 2 }} />

        <Grid container rowGap={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography>Name:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              label="Name"
              placeholder="Enter driver name..."
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography>Password:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              label="Password"
              placeholder="Enter driver password..."
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              Employee Code (auto generated if not provided):
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={employeeCode}
              onChange={(e: any) => setEmployeeCode(e.target.value)}
              label="Employee Code"
              placeholder="Enter driver employee code..."
              fullWidth
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>Role:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Select fullWidth size="small">
              {Object.values(EMPLOYEE_ROLE).map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography>Hourly Rate:</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              value={hourlyRate}
              onChange={(e: any) => setHourlyRate(+e.target.value)}
              label="Hourly Rate"
              placeholder="Enter driver hourly rate..."
              fullWidth
            />
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
