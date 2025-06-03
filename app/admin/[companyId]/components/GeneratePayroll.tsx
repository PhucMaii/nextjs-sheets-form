import {
  Box,
  Grid,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { DateRange as DateRangeIcon } from '@mui/icons-material';
import DateRange from './Modals/DateRangeModal';
import { generateMonthRange, YYYYMMDDFormat } from '@/app/utils/time';
import { LoadingButton } from '@mui/lab';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import useEmployee from '@/hooks/select/useEmployee';

interface IProps {
  showNotification: ShowNotificationType;
  onClose: () => void;
  refresh: () => Promise<void>;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}

export default function GeneratePayroll({
  showNotification,
  onClose,
  refresh,
  defaultStartDate,
  defaultEndDate,
}: IProps) {
  const { companyId }: any = useParams();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [newPayrollRange, setNewPayrollRange] = useState<any>(
    defaultStartDate && defaultEndDate
      ? [defaultStartDate, defaultEndDate]
      : generateMonthRange(),
  );
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState<boolean>(false);

  const { renderMultipleEmployeeSearch, selectedEmployees } = useEmployee();

  const handleGeneratePayroll = async () => {
    if (selectedEmployees.length === 0) {
      showNotification('error', 'Please select at least one employee');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await axios.post(
        getAdminApiUrl(
          companyId,
          '/payroll/generate-payroll',
          `startDate=${newPayrollRange[0]}&endDate=${newPayrollRange[1]}`,
        ),
        {
          yyyymmddStartDate: YYYYMMDDFormat(newPayrollRange[0]),
          yyyymmddEndDate: YYYYMMDDFormat(newPayrollRange[1]),
          employeeIds: selectedEmployees.map((employee) => employee.id),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      await refresh();
      showNotification('success', 'Payroll generated successfully');
      onClose();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error generating the payroll');
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <>
      <DateRange
        open={isSelectRangeOpen}
        onClose={() => setIsSelectRangeOpen(false)}
        dateRange={newPayrollRange}
        setDateRange={setNewPayrollRange}
      />
      <Box>
        <Typography variant="h5" fontWeight={500}>
          Generate Payroll From Schedule
        </Typography>

        <Grid container spacing={2} mt={2}>
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
            <Typography>Start Time</Typography>
            <OutlinedInput
              value={newPayrollRange[0].toDateString()}
              onClick={() => setIsSelectRangeOpen(true)}
              sx={{ width: '100%' }}
              startAdornment={
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              }
              size="small"
            />
          </Grid>

          <Grid
            item
            xs={6}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography>End Time</Typography>
            <OutlinedInput
              value={newPayrollRange[1].toDateString()}
              onClick={() => setIsSelectRangeOpen(true)}
              sx={{ width: '100%' }}
              startAdornment={
                <InputAdornment position="start">
                  <DateRangeIcon />
                </InputAdornment>
              }
              size="small"
            />
          </Grid>
        </Grid>

        <LoadingButton
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          loading={isGenerating}
          onClick={handleGeneratePayroll}
          fullWidth
        >
          Generate Payroll
        </LoadingButton>
      </Box>
    </>
  );
}
