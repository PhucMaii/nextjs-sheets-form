import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Box,
} from '@mui/material';
import React, { useState } from 'react';

interface IDriverReport {
  id: number;
  name: string;
  totalHours: number;
  driverHours: number;
  factoryHours: number;
  cost: number;
}

interface IProps {
  data: IDriverReport[];
}

export default function DriverTablesReport({ data }: IProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate the slice of data to display
  //   const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
  const visibleRows = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ width: '100%', height: '400px !important' }}>
      <TableContainer component={Paper} elevation={0} sx={{ height: '100%' }}>
        <Table stickyHeader aria-label="driver report table">
          <TableHead>
            <TableRow>
              <TableCell>Driver Name</TableCell>
              <TableCell align="right">Total Hours</TableCell>
              <TableCell align="right">Driver Hours</TableCell>
              <TableCell align="right">In Factory Hours</TableCell>
              <TableCell align="right">Est. Payment ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">
                  {(
                    (row?.driverHours || 0) + (row?.factoryHours || 0)
                  )?.toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  {row?.driverHours?.toFixed(2) || 0}
                </TableCell>
                <TableCell align="right">
                  {row?.factoryHours?.toFixed(2) || 0}
                </TableCell>
                <TableCell align="right">${row?.cost?.toFixed(2)}</TableCell>
              </TableRow>
            ))}

            {!data?.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" py={2}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}
