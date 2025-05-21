import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import React from 'react';

interface IProps {
    quotes: any;
}

export default function QuoteTable({ quotes }: IProps) {
  return (
    <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Quote ID</TableCell>
                    <TableCell>Quote Date</TableCell>
                    <TableCell>Quote Amount</TableCell>
                    <TableCell>Quote Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {quotes.map((quote: any) => (
                    <TableRow key={quote.id}>
                        <TableCell>{quote.id}</TableCell>
                        <TableCell>{quote.createdAt}</TableCell>
                        <TableCell>{quote.total}</TableCell>
                        <TableCell>{quote.status}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  )
}
