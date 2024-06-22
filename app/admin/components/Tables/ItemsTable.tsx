import { IItem, Notification } from '@/app/utils/type';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import DeleteModal from '../Modals/delete/DeleteModal';
import { SubCategory } from '@prisma/client';
import EditItem from '../Modals/edit/EditItem';
import EditItemAvailability from '../Modals/edit/EditItemAvailability';

interface IProps {
  items: IItem[];
  handleDeleteItem: (targetItem: IItem) => Promise<void>;
  handleUpdateItem: (updatedItem: IItem) => Promise<void>;
  subCategories: SubCategory[];
  setNotification: Dispatch<SetStateAction<Notification>>;
}

export const itemFields = ['Name', 'Price', 'Subcategory'];
export default function ItemsTable({
  items,
  handleDeleteItem,
  handleUpdateItem,
  subCategories,
  setNotification,
}: IProps) {
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle1">Availability</Typography>
            </TableCell>
            {itemFields &&
              itemFields.map((field: string) => {
                return (
                  <TableCell>
                    <Typography key={field} variant="subtitle1">
                      {field}
                    </Typography>
                  </TableCell>
                );
              })}
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items &&
            items.map((item: IItem) => {
              return (
                <TableRow key={item.id} sx={{ p: 2 }}>
                  <TableCell>
                    {/* <Switch 
                      checked={item.availability} 
                      onChange={(e) => {
                        handleUpdateItem({...item, availability: e.target.checked})
                        console.log({checked: e.target.checked});
                      }}
                    /> */}
                    <EditItemAvailability
                      item={item}
                      setNotification={setNotification}
                      handleUpdateItem={handleUpdateItem}
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>{item?.subCategory?.name || ''}</TableCell>
                  <TableCell>
                    <DeleteModal
                      targetObj={item}
                      handleDelete={handleDeleteItem}
                      includedButton
                    />
                    <EditItem
                      targetItem={item}
                      subCategories={subCategories}
                      handleUpdateItem={handleUpdateItem}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
