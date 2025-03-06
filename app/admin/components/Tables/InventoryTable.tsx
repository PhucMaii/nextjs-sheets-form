import { IInventoryItem } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Select,
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
import { ItemType } from '@prisma/client';
import LoadingModal from '../Modals/LoadingModal';
import { grey } from '@mui/material/colors';

interface IProps {
  inventoryItems: IInventoryItem[];
  showNotification: (type: AlertColor, message: string) => void;
  itemTypes: ItemType[];
  selectedItems: IInventoryItem[];
  setSelectedItems: (item: IInventoryItem[]) => void;
}

export default function InventoryTable({
  inventoryItems,
  showNotification,
  itemTypes,
  selectedItems,
  setSelectedItems,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${API_URL.ADMIN}/inventory?id=${targetObj.id}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to delete item: ' + error);
      showNotification('error', 'Fail to delete item: ' + error);
      setIsLoading(false);
    }
  };

  const handleChangeType = async (
    targetItem: IInventoryItem,
    typeId: number,
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_URL.ADMIN}/inventory/switch-type`,
        {
          id: targetItem.id,
          typeId,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        error?.response?.data?.error || 'Internal Server Error: ' + error,
      );
      setIsLoading(false);
    }
  };

  const onSelectItem = (e: any, item: IInventoryItem) => {
    e.stopPropagation();
    const isExisted = selectedItems.find((i) => i.id === item.id);

    if (isExisted) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const onSelectAll = () => {
    if (selectedItems.length === inventoryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventoryItems);
    }
  };

  return (
    <>
      <LoadingModal open={isLoading} />
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
      <Paper sx={{ overflow: 'scroll', width: '100%' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.length === inventoryItems.length}
                  onClick={onSelectAll}
                />
              </TableCell>
              <TableCell style={{ width: 50 }}></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
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

              const isSelected = selectedItems.some((i) => i.id === item.id);

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
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onClick={(e: any) => onSelectItem(e, item)}
                    />
                  </TableCell>
                  <TableCell>
                    {item.quantity < 0 ? (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e: any) => {
                          e.stopPropagation();
                          e.preventDefault();

                          setViewItemMissingProps((prevState: any) => ({
                            ...prevState,
                            open: true,
                            inventoryItem: item,
                            quantity: item.quantity,
                          }));
                        }}
                      >
                        <PhoneIcon size={20} />
                      </IconButton>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Typography>{item.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item?.typeId || 0}
                      onChange={(e: any) =>
                        handleChangeType(item, e.target.value)
                      }
                    >
                      {itemTypes.map((type: ItemType, index: number) => {
                        return (
                          <MenuItem value={type.id} key={index}>
                            {type.name}
                          </MenuItem>
                        );
                      })}
                      <MenuItem value={0}>N/A</MenuItem>
                    </Select>
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
                        showTargetObj={item.name}
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
