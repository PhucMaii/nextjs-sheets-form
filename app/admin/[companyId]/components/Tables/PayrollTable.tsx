import { IPayroll } from '@/app/utils/type';
import {
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Checkbox,
} from '@mui/material';
import React, { useState } from 'react';
import EditPayroll from '../Modals/edit/EditPayroll';
import { grey } from '@mui/material/colors';
import { ShowNotificationType } from '@/hooks/useNotification';
import StatusText from '../StatusText';
import { PaymentStatus } from '@prisma/client';

interface IProps {
  data: any[];
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
  selectedPayrolls: IPayroll[];
  setSelectedPayrolls: (payrolls: IPayroll[]) => void;
}

export default function PayrollTable({
  data,
  showNotification,
  refresh,
  selectedPayrolls,
  setSelectedPayrolls,
}: IProps) {
  const [editPayrollProps, setEditPayrollProps] = useState<any>({
    open: false,
    payroll: null,
  });

  const handleSelectAll = () => {
    if (selectedPayrolls.length === data.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(data);
    }
  };

  const handleSelect = (payroll: IPayroll) => {
    if (selectedPayrolls.some((p) => p.id === payroll.id)) {
      setSelectedPayrolls(selectedPayrolls.filter((p) => p.id !== payroll.id));
    } else {
      setSelectedPayrolls([...selectedPayrolls, payroll]);
    }
  };

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
            <TableCell>
              <Checkbox
                checked={selectedPayrolls.length === data.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>From - To</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Total Hours</TableCell>
            <TableCell>Pay Rate</TableCell>
            <TableCell>Total Pay</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((payroll: IPayroll) => (
            <TableRow
              key={payroll.id}
              selected={selectedPayrolls.some((p) => p.id === payroll.id)}
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
              <TableCell>
                <Checkbox
                  checked={selectedPayrolls.some((p) => p.id === payroll.id)}
                  onChange={() => handleSelect(payroll)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              <TableCell>
                {payroll?.status && (
                  <StatusText
                    text={payroll?.status || 'N/A'}
                    type={
                      payroll.status === PaymentStatus.Paid
                        ? 'success'
                        : 'error'
                    }
                  />
                )}
              </TableCell>
              <TableCell>{payroll.employee.name}</TableCell>
              <TableCell>
                {payroll.startDate} - {payroll.endDate}
              </TableCell>
              <TableCell>{payroll.employee.role}</TableCell>
              <TableCell>{payroll.employee.payrollType}</TableCell>
              <TableCell>{payroll.hours}</TableCell>
              <TableCell>${payroll.employee.payRate?.toFixed(2)}</TableCell>
              <TableCell>${payroll.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
