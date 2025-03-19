import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function PromotionTable() {
  return (
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Promotion</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Created At</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            
        </TableBody>

    </Table>
  )
}
