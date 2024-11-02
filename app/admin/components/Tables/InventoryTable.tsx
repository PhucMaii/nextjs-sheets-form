import { IInventoryItem } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React from 'react';
import EditInventory from '../Modals/edit/EditInventory';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';

interface IProps {
  inventoryItems: IInventoryItem[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function InventoryTable({
  inventoryItems,
  showNotification,
}: IProps) {
  const handleDelete = async (targetObj: IInventoryItem) => {
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/inventory?id=${targetObj.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete item: ' + error);
      showNotification('error', 'Fail to delete item: ' + error);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Vendor</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Unit Value</TableCell>
          <TableCell>Total Value</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {inventoryItems.map((item: IInventoryItem, index: number) => {
          return (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.vendor.name}</TableCell>
              <TableCell>
                {item.quantity} {item.unit}
              </TableCell>
              <TableCell>${item.unitPrice}</TableCell>
              <TableCell>${item.totalValue}</TableCell>
              <TableCell>
                <Box display="flex" gap={2}>
                    <DeleteModal
                      includedButton
                      targetObj={item}
                      handleDelete={handleDelete}
                    />
                  <EditInventory
                    inventoryItem={item}
                    showNotification={showNotification}
                  />
                </Box>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
