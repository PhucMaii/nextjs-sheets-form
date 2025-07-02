import {
  TableContainer,
  TableRow,
  TableHead,
  Table,
  TableCell,
  TableBody,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';

interface IProps {
  listingCategories: any[];
  categoryId: number;
}

export default function ListingCategoriesTable({
  listingCategories,
  categoryId,
}: IProps) {
  const { companyId }: any = useParams();
  const router = useRouter();

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Profit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listingCategories.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 700,
                  },
                }}
                onClick={() =>
                  router.push(
                    `/admin/${companyId}/items/category/${item.category.id}`,
                  )
                }
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    sx={{
                      '&:hover': {
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 700,
                      },
                    }}
                    variant="subtitle2"
                  >
                    {item?.category?.name}
                  </Typography>
                  {categoryId === item.categoryId && (
                    <Chip label="Current" variant="outlined" size="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 700,
                  },
                }}
                onClick={() =>
                  router.push(`/admin/${companyId}/items/${item.id}`)
                }
              >
                {item?.name}
              </TableCell>
              <TableCell>
                {item?.options && item.options.length > 0
                  ? `From $${item?.options?.reduce((acc: number, option: any) => (option.price < acc ? option.price : acc), Infinity).toFixed(2)}`
                  : `$${item.price.toFixed(2)}`}
              </TableCell>
              <TableCell>
                {item?.options && item.options.length > 0
                  ? 'Variable'
                  : `$${item?.profit?.toFixed(2)}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
