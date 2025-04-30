import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react'

export default function ProductLossTable() {
  return (
    <TableContainer elevation={0} component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Cost</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
            </TableBody>
        </Table>
    </TableContainer>
  )
}