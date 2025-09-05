import { Box, Button, Typography } from '@mui/material';
import React, { memo } from 'react';
import { CSVLink } from 'react-csv';
import { DownloadIcon } from 'lucide-react';
import { IPayroll } from '@/app/utils/type';
import { PayrollType } from '@prisma/client';

interface IProps {
  payrolls: IPayroll[];
  style?: any;
  disabled?: boolean;
}

const PayrollCSV = ({ payrolls, style, disabled }: IProps) => {
  const headers = [
    { label: 'Driver', key: 'name' },
    { label: 'From - To', key: 'from_to' },
    { label: 'Role', key: 'role' },
    { label: 'Hours', key: 'hours' },
    { label: 'Hourly Rate ($)', key: 'hourlyRate' },
    { label: 'Monthly Rate ($)', key: 'monthlyRate' },
    { label: 'Total ($)', key: 'total' },
  ];

  const formattedData = payrolls.map((payroll) => ({
    name: payroll.employee.name,
    from_to: `${payroll.startDate} - ${payroll.endDate}`,
    role: payroll.employee.role,
    hours: payroll.hours?.toFixed(2),
    hourlyRate: payroll.employee.payrollType === PayrollType.hourly ? payroll.employee.payRate?.toFixed(2) || '0.00' : 'N/A',
    monthlyRate: payroll.employee.payrollType === PayrollType.monthly ? payroll.employee.payRate?.toFixed(2) || '0.00' : 'N/A',
    total: payroll.total?.toFixed(2),
  }));

  return (
    <CSVLink
      filename="payroll-data.csv"
      data={formattedData}
      headers={headers}
      aria-disabled={true}
    >
      <Button variant="outlined" size="small" {...style} disabled={disabled}>
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon size={16} />
          <Typography variant="subtitle2" fontWeight="bold">
            Export CSV
          </Typography>
        </Box>
      </Button>
    </CSVLink>
  );
};

export default memo(PayrollCSV, (prev, next) => {
  return Object.is(prev.payrolls, next.payrolls);
});
