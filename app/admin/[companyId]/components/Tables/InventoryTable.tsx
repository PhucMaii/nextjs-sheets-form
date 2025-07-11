import { IInventoryItem } from '@/app/utils/type';
import {
  AlertColor,
  Box,
  Button,
  Card,
  Checkbox,
  Typography,
  alpha,
} from '@mui/material';
import React, { memo, useState } from 'react';
import EditInventory from '../Modals/edit/EditInventory';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import BatchQuantityModal from '../Inventory/BatchQuantityModal';
import { Package } from 'lucide-react';
import ViewItemMissing from '../Modals/ViewItemMissing';
import { ItemType } from '@prisma/client';
import LoadingModal from '../Modals/LoadingModal';
import { useParams } from 'next/navigation';
import InventoryItemCard from '../Inventory/InventoryItemCard';
import { generateErrorMsg } from '@/app/lib/error';
import SingleFieldUpdate from '../Modals/edit/SingleFieldUpdate';

interface IProps {
  inventoryItems: IInventoryItem[];
  showNotification: (type: AlertColor, message: string) => void;
  itemTypes: ItemType[];
}

// Main Table Component
const InventoryTable = ({
  inventoryItems,
  showNotification,
  itemTypes,
}: IProps) => {
  const { companyId }: any = useParams();
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
  const [isOpenBulkTypeUpdate, setIsOpenBulkTypeUpdate] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<IInventoryItem[]>([]);
  const [batchProps, setBatchProps] = useState<any>({
    open: false,
    inventoryItem: inventoryItems[0],
  });

  // const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const handleDelete = async (e: any, targetObj: IInventoryItem) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/inventory?id=${targetObj.id}`),
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

  const handleBulkSwitchType = async (field: string, newType: any) => {
    try {
      const response = await axios.put(
        `${getAdminApiUrl(companyId, '/inventory/switch-type')}`,
        {
          idList: selectedItems.map((item) => item.id),
          typeId: newType,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      setSelectedItems([]);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', generateErrorMsg(error));
    }
  };

  const handleChangeType = async (
    targetItem: IInventoryItem,
    typeId: number,
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/inventory/switch-type'),
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
    console.log('onSelectItem', e, item);
    const isExisted = selectedItems.find((i) => i.id === item.id);

    if (isExisted) {
      setSelectedItems((prevSelectedItems: IInventoryItem[]) => {
        const newSelectedItems = prevSelectedItems.filter(
          (i: IInventoryItem) => i.id !== item.id,
        );
        return newSelectedItems;
      });
    } else {
      setSelectedItems((prevSelectedItems: IInventoryItem[]) => {
        const newSelectedItems = [...prevSelectedItems, item];
        return newSelectedItems;
      });
    }
  };

  const onSelectAll = () => {
    if (selectedItems.length === inventoryItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventoryItems);
    }
  };

  // Bulk Actions Header
  const renderBulkActions = () => (
    <Card
      sx={{
        my: 2,
        // bgcolor: alpha('#3B82F6', 0.05),
        border: `1px solid ${alpha('#3B82F6', 0.2)}`,
        borderRadius: 1,
        boxShadow: 'none',
      }}
    >
      <Box sx={{ py: 1, px: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Checkbox
              checked={selectedItems.length === inventoryItems.length}
              indeterminate={
                selectedItems.length > 0 &&
                selectedItems.length < inventoryItems.length
              }
              onChange={onSelectAll}
            />
            <Typography variant="subtitle1" fontWeight={600}>
              {selectedItems.length > 0
                ? `${selectedItems.length} items selected`
                : 'Select items for bulk actions'}
            </Typography>
          </Box>

          {selectedItems.length > 0 && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
                onClick={() => setIsOpenBulkTypeUpdate(true)}
              >
                Bulk Edit
              </Button>
              {/* <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Delete Selected
              </Button> */}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );

  // Empty State
  const renderEmptyState = () => (
    <Card sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
      <Package size={64} color="#9CA3AF" style={{ marginBottom: 16 }} />
      <Typography variant="h6" color="text.secondary" mb={1}>
        No inventory items found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start by adding your first inventory item
      </Typography>
    </Card>
  );

  if (inventoryItems.length === 0) {
    return renderEmptyState();
  }

  return (
    <>
      <SingleFieldUpdate
        open={isOpenBulkTypeUpdate}
        onClose={() => setIsOpenBulkTypeUpdate(false)}
        label="Item Type"
        handleUpdate={handleBulkSwitchType}
        menuList={itemTypes || []}
        title="Switch Items Type"
        updatedField="type"
        renderField="name"
      />
      <Box>
        {/* Modals */}
        {batchProps.open && (
          <BatchQuantityModal
            open={batchProps.open}
            onClose={() =>
              setBatchProps((prevState: any) => ({ ...prevState, open: false }))
            }
            fifoList={batchProps.inventoryItem?.fifo || []}
            showNotification={showNotification}
          />
        )}
        <LoadingModal open={isLoading} />
        {editItemProps.inventoryItem && (
          <EditInventory
            inventoryItem={editItemProps.inventoryItem}
            open={editItemProps.open}
            onClose={() =>
              setEditItemProps(() => ({ inventoryItem: null, open: false }))
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

        {/* Bulk Actions */}
        {renderBulkActions()}

        {/* Items List */}
        <Box>
          {inventoryItems.map((item: IInventoryItem, index: number) => {
            const isSelected = selectedItems.some((i) => i.id === item.id);
            return (
              <InventoryItemCard
                key={item.id || index}
                item={item}
                isSelected={isSelected}
                onSelect={(e) => onSelectItem(e, item)}
                onEdit={() =>
                  setEditItemProps({ open: true, inventoryItem: item })
                }
                onViewBatch={() =>
                  setBatchProps({ open: true, inventoryItem: item })
                }
                onDelete={(e) => handleDelete(e, item)}
                itemTypes={itemTypes}
                onChangeType={(typeId) => handleChangeType(item, typeId)}
                companyId={companyId}
              />
            );
          })}
        </Box>
      </Box>
    </>
  );
};

export default memo(InventoryTable, (prev, next) => {
  return (
    JSON.stringify(prev.inventoryItems) ===
      JSON.stringify(next.inventoryItems)
  );
});

// export default memo(InventoryTable, (prev, next) => {
//   return (
//     JSON.stringify(prev.inventoryItems) === JSON.stringify(next.inventoryItems)
//   );
// });
