import { IInventoryItem } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import EditInventory from '../Modals/edit/EditInventory';
import DeleteModal from '../Modals/delete/DeleteModal';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import BatchQuantityModal from '../Inventory/BatchQuantityModal';
import { PhoneIcon } from 'lucide-react';
import ViewItemMissing from '../Modals/ViewItemMissing';
import { grey } from '@mui/material/colors';

interface IProps {
  inventoryItems: IInventoryItem[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function InventoryTable({
  inventoryItems,
  showNotification,
}: IProps) {
  const [editItemProps, setEditItemProps] = useState<any>({
    open: false,
    inventoryItem: null,
  });
  const [viewItemMissingProps, setViewItemMissingProps] = useState<any>({
    open: false,
    inventoryItem: inventoryItems[0],
    quantity: inventoryItems[0]?.quantity || 0,
  });

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
    <>
      {editItemProps.inventoryItem && (
        <EditInventory
          inventoryItem={editItemProps.inventoryItem}
          open={editItemProps.open}
          onClose={() =>
            setEditItemProps(() => ({
              inventoryItem: null,
              open: false,
            }))
          }
          showNotification={showNotification}
        />
      )}
      {viewItemMissingProps && (
        <ViewItemMissing
          open={viewItemMissingProps.open}
          onClose={() =>
            setViewItemMissingProps((prevState: any) => ({
              ...prevState,
              open: false,
            }))
          }
          inventoryItem={viewItemMissingProps.inventoryItem}
          quantity={viewItemMissingProps.quantity}
        />
      )}
      <Paper sx={{ overflow: 'scroll' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: 50 }}></TableCell>
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
                <TableRow
                  key={index}
                  sx={{ '&:hover': { backgroundColor: grey[50] } }}
                  onClick={() =>
                    setEditItemProps((prevState: any) => ({
                      ...prevState,
                      open: true,
                      inventoryItem: item,
                    }))
                  }
                >
                  <TableCell>
                    {item.quantity < 0 ? (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          setViewItemMissingProps((prevState: any) => ({
                            ...prevState,
                            open: true,
                            inventoryItem: item,
                            quantity: item.quantity,
                          }))
                        }
                      >
                        <PhoneIcon size={20} />
                      </IconButton>
                    ) : null}
                  </TableCell>
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
                  <TableCell sx={{ width: 200 }}>
                    <Box
                      display="flex"
                      gap={1}
                      justifyContent="space-between"
                      alignItems="center"
                    >
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
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
}
