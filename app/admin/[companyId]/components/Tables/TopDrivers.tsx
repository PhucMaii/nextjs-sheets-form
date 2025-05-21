import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from '@mui/material';
import React from 'react';

interface ITopDriver {
  id: number;
  name: string;
  driverHours: number;
  cost: number;
}

interface IProps {
  data: ITopDriver[];
  limit?: number;
}

export default function TopDrivers({ data, limit = 5 }: IProps) {
  // Sort drivers by hours in descending order and take top N
  const topDrivers = [...data]
    .sort((a, b) => (b.driverHours || 0) - (a.driverHours || 0))
    .slice(0, limit);

  return (
    <Box sx={{ width: '100%', height: '280px' }}>
      <Typography variant="h6" gutterBottom>
        Top {limit} Drivers 🎉
      </Typography>
      <TableContainer component={Paper} elevation={0} sx={{ height: '100%' }}>
        <Table stickyHeader size="small" aria-label="top drivers table">
          <TableHead>
            <TableRow>
              <TableCell>Driver Name</TableCell>
              <TableCell align="right">Hours</TableCell>
              <TableCell align="right">Est. Payment ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topDrivers.map((driver) => (
              <TableRow
                key={driver.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {driver.name}
                </TableCell>
                <TableCell align="right">
                  {driver?.driverHours?.toFixed(2)}
                </TableCell>
                <TableCell align="right">{driver?.cost?.toFixed(2)}</TableCell>
              </TableRow>
            ))}

            {!data.length && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" py={2}>
                    No drivers available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
