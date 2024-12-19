import { IInventoryItem } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import EditInventory from '../Modals/edit/EditInventory';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import BatchQuantityModal from '../Inventory/BatchQuantityModal';

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
    <Paper sx={{ overflow: 'scroll' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Vendor - Unit Value</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Total Value</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {inventoryItems.map((item: IInventoryItem, index: number) => {
            let unit;
            for (const vendorItem of item.vendorItem) {
              unit = vendorItem.unit.find((vUnit: any) => vUnit?.ratio === 1);
            }

            return (
              <TableRow key={index}>
                <TableCell>
                  <Typography>{item.name}</Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={3}>
                    {item?.vendorItem?.map((vItem) => {
                      const smallestUnit = vItem?.unit.find(
                        (unit: any) => unit?.ratio === 1,
                      );
                      return (
                        <Typography>
                          {vItem?.vendor?.name}{' '}
                          <strong>(${smallestUnit?.unitPrice})</strong>
                        </Typography>
                      );
                    })}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1} alignItems="center">
                    <Typography>
                      {item?.quantity} {unit?.unit}
                    </Typography>
                    <BatchQuantityModal
                      fifoList={item?.fifo || []}
                      showNotification={showNotification}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography>${item?.totalValue?.toFixed(2)}</Typography>
                </TableCell>
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
    </Paper>
  );
}
