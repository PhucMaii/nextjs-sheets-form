import { IPayroll } from '@/app/utils/type';
import {
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
} from '@mui/material';
import React, { useState } from 'react';
import EditPayroll from '../Modals/edit/EditPayroll';
import { grey } from '@mui/material/colors';
import { ShowNotificationType } from '@/hooks/useNotification';

interface IProps {
  data: any[];
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function PayrollTable({ data, showNotification, refresh }: IProps) {
  const [editPayrollProps, setEditPayrollProps] = useState<any>({
    open: false,
    payroll: null,
  });
  return (
    <>
      {editPayrollProps.payroll && (
        <EditPayroll
          open={editPayrollProps.open}
          onClose={() => {
            setEditPayrollProps({
              open: false,
              payroll: null,
            });
          }}
          payroll={editPayrollProps.payroll}
          showNotification={showNotification}
          refresh={refresh}
        />
      )}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>From - To</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Total Hours</TableCell>
            <TableCell>Total Pay</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((payroll: IPayroll) => (
            <TableRow
              key={payroll.id}
              onClick={() => {
                setEditPayrollProps({
                  open: true,
                  payroll,
                });
              }}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: grey[100],
                },
              }}
            >
              <TableCell>{payroll.employee.name}</TableCell>
              <TableCell>
                {payroll.startDate} - {payroll.endDate}
              </TableCell>
              <TableCell>{payroll.employee.role}</TableCell>
              <TableCell>{payroll.employee.payrollType}</TableCell>
              <TableCell>{payroll.hours}</TableCell>
              <TableCell>${payroll.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
