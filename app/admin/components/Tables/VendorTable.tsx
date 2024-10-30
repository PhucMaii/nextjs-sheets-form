import { IVendor } from '@/app/utils/type';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import React from 'react';

interface IProps {
    vendors: IVendor[];
}


export default function VendorTable({vendors}: IProps) {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Joined Date</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {vendors.length > 0 && vendors.map((vendor: IVendor, index: number) => {
                return (
                    <TableRow key={index}>
                        <TableCell>{vendor.id}</TableCell>
                        <TableCell>{vendor.name}</TableCell>    
                        <TableCell>{vendor.phoneNumber}</TableCell>
                        <TableCell>{vendor.address}</TableCell>
                        <TableCell>{vendor.joinedDate}</TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
    </Table>
  )
}
