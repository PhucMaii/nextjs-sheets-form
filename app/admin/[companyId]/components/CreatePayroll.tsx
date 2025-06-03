import { DateRange as DateRangeIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import useEmployee from '@/hooks/select/useEmployee';
import DateRange from './Modals/DateRangeModal';
import { ClockIcon } from 'lucide-react';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import { YYYYMMDDFormat } from '@/app/utils/time';

interface IProps {
  startDate: Date;
  endDate: Date;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
  onClose: () => void;
}

export default function CreatePayroll({
  startDate,
  endDate,
  showNotification,
  refresh,
  onClose,
}: IProps) {
  const { companyId }: any = useParams();

  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);
  const [newPayroll, setNewPayroll] = useState<any>({
    hours: 0,
    total: 0,
    employeeIds: [],
  });
  const [dateRange, setDateRange] = useState<Date[]>([startDate, endDate]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { renderMultipleEmployeeSearch, selectedEmployees } = useEmployee();

  const handleCreatePayroll = async () => {
    if (
      selectedEmployees.length === 0 ||
      newPayroll.hours === 0 ||
      newPayroll.total === 0
    ) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      const response = await axios.post(getAdminApiUrl(companyId, '/payroll'), {
        hours: newPayroll.hours,
        total: newPayroll.total,
        startDate: dateRange[0],
        endDate: dateRange[1],
        yyyymmddStartDate: YYYYMMDDFormat(dateRange[0]),
        yyyymmddEndDate: YYYYMMDDFormat(dateRange[1]),
        employeeIds: selectedEmployees.map((employee) => employee.id),
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refresh();
      showNotification('success', 'Payroll created successfully');
      onClose();
    } catch (error: any) {
      showNotification('error', 'There was an error creating the payroll');
      console.log(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
      <Box display="flex" flexDirection="column" gap={2}>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Employee</Typography>
            {renderMultipleEmployeeSearch()}
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Hours</Typography>
            <OutlinedInput
              placeholder="Hours"
              type="number"
              fullWidth
              value={newPayroll.hours}
              onChange={(e) =>
                setNewPayroll({ ...newPayroll, hours: +e.target.value })
              }
              startAdornment={
                <InputAdornment position="start">
                  <ClockIcon size={14} />
                </InputAdornment>
              }
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Total</Typography>
            <OutlinedInput
              placeholder="Total"
              type="number"
              fullWidth
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
              value={newPayroll.total}
              onChange={(e) =>
                setNewPayroll({ ...newPayroll, total: +e.target.value })
              }
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>Start Date</Typography>
            <OutlinedInput
              placeholder="Start Date"
              fullWidth
              readOnly
              sx={{ cursor: 'pointer' }}
              startAdornment={
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              }
              value={dateRange[0].toDateString()}
              onClick={() => setIsSelectRangeOpen(true)}
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>End Date</Typography>
            <OutlinedInput
              placeholder="End Date"
              fullWidth
              readOnly
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsSelectRangeOpen(true)}
              startAdornment={
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              }
              value={dateRange[1].toDateString()}
            />
          </Grid>

          <Grid item xs={12}>
            <LoadingButton
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleCreatePayroll}
              loading={isCreating}
            >
              Create
            </LoadingButton>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
