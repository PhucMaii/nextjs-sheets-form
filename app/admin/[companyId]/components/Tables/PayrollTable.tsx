import { Table, TableCell, TableRow, TableHead, TableBody } from '@mui/material'
import React from 'react'

interface IProps {
    data: any[];
}

export default function PayrollTable({ data }: IProps) {
    console.log(data);
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Shifts</TableCell>
                <TableCell>Total Hours</TableCell>
                <TableCell>Total Pay</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {/* {data.map((item) => (
                <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.shifts}</TableCell>
                    <TableCell>{item.totalHours}</TableCell>
                    <TableCell>{item.totalPay}</TableCell>
                </TableRow>
            ))} */}
        </TableBody>
    </Table>
  )
}