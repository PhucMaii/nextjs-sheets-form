import {
  TableCell,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Button,
  Box,
} from '@mui/material';
import React, { Fragment, useMemo } from 'react';
import Shift from './Shift';
import { grey } from '@mui/material/colors';
import { PlusIcon } from 'lucide-react';
import { Employee } from '@prisma/client';
import { IEmployee } from '@/app/utils/type';

// const days = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday',
// ];

interface IProps {
  employees: IEmployee[];
  selectedWeek: any;
  shifts: any[];
  onOpenAddShift: (employee: Employee, date: string) => void;
}

export default function ScheduledShiftTable({
  employees,
  selectedWeek,
  shifts,
  onOpenAddShift,
}: IProps) {
  console.log(shifts, 'shifts');
  const daysInWeek = useMemo(() => {
    if (!selectedWeek) return [];

    const startDate = new Date(selectedWeek[0]);
    const endDate = new Date(selectedWeek[1]);
    const dates = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(d.toLocaleDateString('en-US', { dateStyle: 'full' }));
    }

    return dates;
  }, [selectedWeek]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderRight: `1px solid ${grey[200]}` }}>
              Employees
            </TableCell>
            {daysInWeek.map((day: string) => (
              <TableCell
                align="center"
                key={day}
                sx={{ borderRight: `1px solid ${grey[200]}` }}
              >
                {day}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee: any) => (
            <TableRow key={employee.id}>
              <TableCell sx={{ borderRight: `1px solid ${grey[200]}` }}>
                {employee.name}
              </TableCell>
              {daysInWeek.map((day: string, index: number) => {
                const employeeShifts = shifts.filter(
                  (shift: any) =>
                    shift.date === day && shift.employeeId === employee.id,
                );

                if (!employeeShifts || employeeShifts.length === 0) {
                  return (
                    <TableCell
                      align="center"
                      key={`${employee.id}-${day}-${index}`}
                      sx={{ borderRight: `1px solid ${grey[50]}` }}
                    >
                      <Button
                        onClick={() => onOpenAddShift(employee, day)}
                        sx={{
                          backgroundColor: grey[50],
                          width: '100%',
                          height: '100%',
                          color: grey[600],
                        }}
                      >
                        <PlusIcon />
                      </Button>
                    </TableCell>
                  );
                }

                return (
                  <TableCell
                    // align="center"
                    key={`${employee.id}-${day}-${index}`}
                    sx={{ 
                      borderRight: `1px solid ${grey[200]}`, 
                      p: 1,
                      verticalAlign: 'top'
                    }}
                  >
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      height="100%"
                      // justifyContent="center"
                    >
                      {employeeShifts?.map((shift: any) => (
                        <Fragment key={`${employee.id}-${day}-${index}`}>
                          <Shift
                            key={`${employee.id}-${day}-${index}`}
                            shift={shift}
                          />
                        </Fragment>
                      ))}
                      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <Button
                        onClick={() => onOpenAddShift(employee, day)}
                        sx={{
                          // backgroundColor: grey[50],
                          width: '100%',
                          height: '100%',
                          color: grey[600],
                        }}
                      >
                        <PlusIcon />
                      </Button>

                      </Box>
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
