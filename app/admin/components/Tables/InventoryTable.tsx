import { Table, TableCell, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function InventoryTable() {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Value</TableCell>
                <TableCell>Total Value</TableCell>
            </TableRow>
        </TableHead>
    </Table>
  )
}
