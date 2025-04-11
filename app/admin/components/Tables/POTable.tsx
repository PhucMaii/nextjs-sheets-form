import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function POTable() {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Received</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Est. Arrival</TableCell>
            </TableRow>
        </TableHead>
        <TableBody></TableBody>
    </Table>
  )
}
