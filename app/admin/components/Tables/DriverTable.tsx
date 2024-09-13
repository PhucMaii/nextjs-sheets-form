import { IDriver, Notification } from '@/app/utils/type';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import EditDriver from '../Modals/edit/EditDriver';
import DeleteDriver from '../Modals/delete/DeleteDriver';

interface IProps {
  drivers: IDriver[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  mutateDrivers: any;
}

export default function DriverTable({
  drivers,
  setNotification,
  mutateDrivers,
}: IProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Total Routes</TableCell>
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
                <TableCell>{driver.routes.length}</TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="row" gap={1}>
                    <DeleteDriver
                      driver={driver}
                      setNotification={setNotification}
                      mutateDrivers={mutateDrivers}
                    />
                    <EditDriver
                      driver={driver}
                      setNotification={setNotification}
                      mutateDrivers={mutateDrivers}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
