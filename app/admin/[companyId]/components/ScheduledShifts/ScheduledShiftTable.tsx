import {
  TableCell,
  Table,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Button,
} from '@mui/material';
import React, { useMemo } from 'react';
import Shift from './Shift';
import { grey } from '@mui/material/colors';
import { PlusIcon } from 'lucide-react';
import { Employee } from '@prisma/client';

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

interface IProps {
  employees: Employee[];
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

   const daysInWeek = useMemo(() => {
    if (!selectedWeek) return [];
    
    const startDate = new Date(selectedWeek[0]);
    const endDate = new Date(selectedWeek[1]);
    const dates = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toLocaleDateString('en-US', { dateStyle: 'full' }));
    }
    

    return dates;
   }, [selectedWeek]);


  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{borderRight: `1px solid ${grey[200]}`}}>Employees</TableCell>
            {daysInWeek.map((day: string) => (
              <TableCell align="center" key={day} sx={{borderRight: `1px solid ${grey[200]}`}}>{day}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee: any) => (
            <TableRow key={employee.id}>
              <TableCell sx={{borderRight: `1px solid ${grey[200]}`}}>{employee.name}</TableCell>
              {daysInWeek.map((day: string, index: number) => {
                const shift = shifts.find(
                  (shift: any) =>
                    shift.day.split(' ')[1] === day && shift.employeeId === employee.id,
                );

                if (!shift) {
                  return <TableCell align="center" key={`${employee.id}-${day}-${index}`} sx={{borderRight: `1px solid ${grey[200]}`}}>
                    <Button onClick={() => onOpenAddShift(employee, day)} sx={{
                        backgroundColor: grey[200],
                        width: '100%',
                        height: '100%',
                        color: grey[800],
                    }}>
                        <PlusIcon />
                    </Button>
                  </TableCell>;
                }

                return (
                  <TableCell align="center" key={`${employee.id}-${day}-${index}`} sx={{borderRight: `1px solid ${grey[200]}`}}>
                    <Shift
                      key={`${employee.id}-${day}-${index}`}
                      shift={shift}
                    />
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
