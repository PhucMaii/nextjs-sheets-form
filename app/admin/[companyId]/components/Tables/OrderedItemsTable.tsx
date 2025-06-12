import { Table, TableRow, TableCell, TableHead } from '@mui/material'
import React from 'react'

const OrderedItemsTable = () => {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>GST</TableCell>
                <TableCell>PST</TableCell>
                <TableCell>Total</TableCell>
            </TableRow>
        </TableHead>
    </Table>
  )
}

export default OrderedItemsTable