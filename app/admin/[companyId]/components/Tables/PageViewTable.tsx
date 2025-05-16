import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TableContainer,
} from '@mui/material';
import { Trash2Icon } from 'lucide-react';
import React from 'react';

export default function PageViewTable({ pageViews }: { pageViews: any[] }) {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {pageViews.map((pageView) => (
            <TableRow key={pageView.id}>
              <TableCell>{pageView.id}</TableCell>
              <TableCell>{pageView.title}</TableCell>
              <TableCell sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton>
                  <Trash2Icon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
