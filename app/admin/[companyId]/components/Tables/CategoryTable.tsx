import { ICategory } from '@/app/utils/type';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from '@mui/material';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

interface IProps {
  categories: ICategory[];
}

export default function CategoryTable({ categories }: IProps) {
  const { companyId }: any = useParams();
  const router = useRouter();
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Clients</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              onClick={() =>
                router.push(`/admin/${companyId}/items/category/${category.id}`)
              }
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
            >
              <TableCell>{category.name}</TableCell>
              <TableCell>{category?.items?.length || 0} items</TableCell>
              <TableCell>{category?.users?.length || 0} clients</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
