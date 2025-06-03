import { IPayroll } from '@/app/utils/type';
import { Table, TableCell, TableRow, TableHead, TableBody } from '@mui/material'
import React from 'react'

interface IProps {
    data: any[];
}

export default function PayrollTable({ data }: IProps) {
    console.log({data});
  return (
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
                <TableRow key={payroll.id}>
                    <TableCell>{payroll.employee.name}</TableCell>
                    <TableCell>{payroll.startDate} - {payroll.endDate}</TableCell>
                    <TableCell>{payroll.employee.role}</TableCell>
                    <TableCell>{payroll.employee.payrollType}</TableCell>
                    <TableCell>{payroll.hours}</TableCell>
                    <TableCell>${payroll.total.toFixed(2)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
  )
}