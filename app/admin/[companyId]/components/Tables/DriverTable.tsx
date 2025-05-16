import { IDriver } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import EditDriver from '../Modals/edit/EditDriver';
import DeleteDriver from '../Modals/delete/DeleteDriver';

interface IProps {
  drivers: IDriver[];
  showNotification: (type: AlertColor, message: string) => void;
  mutateDrivers: any;
}

export default function DriverTable({
  drivers,
  showNotification,
  mutateDrivers,
}: IProps) {
  return (
    <Paper sx={{ overflow: 'scroll' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Employee Code</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Total Routes</TableCell>
            <TableCell>Hourly Rate</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {drivers.length > 0 &&
            drivers.map((driver: IDriver, index: number) => {
              return (
                <TableRow key={index}>
                  <TableCell>{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver?.employeeCode}</TableCell>
                  <TableCell>{driver?.role}</TableCell>
                  <TableCell>{driver.routes.length}</TableCell>
                  <TableCell>${driver?.hourlyRate?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="row" gap={1}>
                      <DeleteDriver
                        driver={driver}
                        showNotification={showNotification}
                        mutateDrivers={mutateDrivers}
                      />
                      <EditDriver
                        driver={driver}
                        showNotification={showNotification}
                        mutateDrivers={mutateDrivers}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Paper>
  );
}
