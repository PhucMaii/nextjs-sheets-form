import { Box, Button, Typography } from '@mui/material';
import React, { memo } from 'react';
import { CSVLink } from 'react-csv';
import { DownloadIcon } from 'lucide-react';

interface IProps {
  driverData: any[];
  style?: any;
}

const PayrollCSV = ({ driverData, style }: IProps) => {
  const headers = [
    { label: 'Driver', key: 'name' },
    { label: 'Shifts', key: 'shifts' },
    { label: 'Hours', key: 'hours' },
    { label: 'Hourly Rate', key: 'hourlyRate' },
  ];

  return (
    <CSVLink data={driverData} headers={headers} aria-disabled={true}>
      <Button variant="outlined" size="small" {...style}>
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon />
          <Typography sx={{ fontSize: 15 }} fontWeight="bold">
            Export CSV
          </Typography>
        </Box>
      </Button>
    </CSVLink>
  );
};

export default memo(PayrollCSV, (prev, next) => {
  return Object.is(prev.driverData, next.driverData);
});
