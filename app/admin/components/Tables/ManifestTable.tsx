'use client';
import { minifyNumber } from '@/app/utils/number';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import React, { useMemo, useState } from 'react';

interface IProps {
  manifest: any;
  isMinify: boolean;
}

const rowsPerPage = 10;

export default function ManifestTable({ manifest, isMinify }: IProps) {
  const [page, setPage] = useState<number>(0);
  const sortedManifestKey = useMemo(() => {
    if (!manifest) {
      return null;
    }

    return Object.keys(manifest)
      .filter((item: string) => manifest[item].quantity > 0)
      .sort(
        (item1: string, item2: string) => manifest[item2].quantity - manifest[item1].quantity,
      );
  }, [manifest]);

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };
  return (
    <Paper elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell align="right">Revenue ($)</TableCell>
            <TableCell align="right">Revenue (%)</TableCell>
            <TableCell align="right">Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedManifestKey &&
            sortedManifestKey
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{item}</TableCell>
                    <TableCell align="right">${isMinify ? minifyNumber(manifest[item].price) : manifest[item].price.toFixed(2)}</TableCell>
                    <TableCell align="right">{manifest[item].percentage} %</TableCell>
                    <TableCell align="right">{manifest[item].quantity}</TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={sortedManifestKey?.length || 0}
        rowsPerPage={10}
        page={page}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
}
