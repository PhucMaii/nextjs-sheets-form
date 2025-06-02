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
import React, { useContext } from 'react';
// import EditDriver from '../Modals/edit/EditDriver';
import DeleteDriver from '../Modals/delete/DeleteDriver';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { grey } from '@mui/material/colors';
import { UserContext } from '@/app/context/UserContextAPI';
import { EMPLOYEE_ROLE } from '@/app/utils/enum';

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
  const { user } = useContext(UserContext);

  const router = useRouter();
  const { companyId }: any = useParams();

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
                <TableRow
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: grey[100],
                    },
                  }}
                  onClick={() => {
                    if (user?.role !== EMPLOYEE_ROLE.SUPER_ADMIN) {
                      return;
                    }
                    router.push(`/admin/${companyId}/employees/${driver.id}`);
                  }}
                >
                  <TableCell>{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver?.employeeCode}</TableCell>
                  <TableCell>{driver?.role}</TableCell>
                  <TableCell>{driver.routes.length}</TableCell>
                  <TableCell>
                    ${driver?.payRate?.toFixed(2) || 0}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="row" gap={1}>
                      {user?.role === EMPLOYEE_ROLE.SUPER_ADMIN && (
                        <DeleteDriver
                          driver={driver}
                          showNotification={showNotification}
                          mutateDrivers={mutateDrivers}
                        />
                      )}
                      {/* <EditDriver
                        driver={driver}
                        showNotification={showNotification}
                        mutateDrivers={mutateDrivers}
                      /> */}
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
