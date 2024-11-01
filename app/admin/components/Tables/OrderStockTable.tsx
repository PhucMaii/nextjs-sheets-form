import { Table, TableCell, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function OrderStockTable() {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Cost</TableCell>
                <TableCell>Total Cost</TableCell>
            </TableRow>
        </TableHead>
    </Table>
  )
}
