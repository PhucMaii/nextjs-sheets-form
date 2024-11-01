import {
  AlertColor,
  Box,
  Button,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { IInventoryItem } from '@/app/utils/type';
import { units } from '@/app/lib/constant';
import axios from 'axios';

interface IProps {
  inventoryItem: IInventoryItem;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditInventory({
  inventoryItem,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [updatedItem, setUpdatedItem] = useState<any>(inventoryItem);

  const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);

  useEffect(() => {
    if (inventoryItem) {
      setUpdatedItem(inventoryItem);
    }
  }, [inventoryItem]);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/inventory`, {
        id: inventoryItem.id,
        name: updatedItem.name,
        vendorId: updatedItem.vendorId,
        quantity: updatedItem.quantity,
        unitPrice: updatedItem.unitPrice,
        unit: updatedItem.unit,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setOpen(false);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      showNotification('error', 'Fail to save update: ' + error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Inventory"
            buttonLabel="EDIT"
            buttonProps={{ loading: isLoading }}
            onClose={() => setOpen(false)}
            onClick={handleUpdate}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Name</Typography>
              <TextField
                fullWidth
                placeholder="Enter item name..."
                value={updatedItem.name}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, name: e.target.value })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Quantity</Typography>
              <TextField
                fullWidth
                placeholder="Enter item quantity..."
                type="number"
                value={updatedItem.quantity}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, quantity: +e.target.value })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Vendor</Typography>
              <Select
                value={updatedItem.vendorId}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, vendorId: +e.target.value })
                }
              >
                <MenuItem value={-1} disabled>
                  -- Choose a vendor --
                </MenuItem>
                {vendors &&
                  vendors?.data.map((vendor: any, index: number) => (
                    <MenuItem key={index} value={vendor.id}>
                      {vendor.name}
                    </MenuItem>
                  ))}
              </Select>
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Unit</Typography>
              <Select
                value={updatedItem.unit}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, unit: e.target.value })
                }
              >
                {units.map((unit, index) => (
                  <MenuItem key={index} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Unit Price</Typography>
              <TextField
                fullWidth
                placeholder="Enter item name..."
                type="number"
                value={updatedItem.unitPrice}
                onChange={(e) =>
                  setUpdatedItem({ ...updatedItem, unitPrice: +e.target.value })
                }
              />
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
