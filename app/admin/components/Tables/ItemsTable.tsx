import { IItem } from '@/app/utils/type';
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import DeleteModal from '../Modals/delete/DeleteModal';

interface IProps {
  items: IItem[];
  handleDeleteItem: (targetItem: IItem) => Promise<void>;
}

export default function ItemsTable({ items, handleDeleteItem }: IProps) {
    const itemFields = ['Name', 'Price', 'Subcategory'];

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell variant="head">
              <Checkbox />
            </TableCell>
            {
                itemFields && itemFields.map((field: string) => {
                    return (
                        <TableCell>
                            <Typography key={field} variant="subtitle1">{field}</Typography>
                        </TableCell>
                    )
                })
            }
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items &&
            items.map((item: IItem) => {
              return (
                <TableRow key={item.id} sx={{p: 2}}>
                  <TableCell variant="head">
                    <Checkbox />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>{item?.subCategory?.name || ''}</TableCell>
                  <TableCell>
                    <DeleteModal targetObj={item} handleDelete={handleDeleteItem} includedButton/>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
