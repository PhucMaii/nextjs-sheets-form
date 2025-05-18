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

export default function PageViewTable({ pageViews, setPageViews }: { pageViews: any[], setPageViews: any }) {

  const onRemove = (pageView: any) => {
    setPageViews((prev: any) => prev.filter((item: any) => item.id !== pageView.id));
  }

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
                <IconButton onClick={() => onRemove(pageView)}>
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
