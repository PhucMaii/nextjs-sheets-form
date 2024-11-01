import {
  AlertColor,
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import { units } from '@/app/lib/constant';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import AddVendor from './AddVendor';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddInventory({
  open,
  onClose,
  showNotification,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddVendor, setIsOpenAddVendor] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<any>({
    name: '',
    quantity: 0,
    vendorId: -1,
    unit: 'bags',
    unitPrice: 0,
  });

  const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);

  const handleAddInventory = async () => {
    setIsLoading(true);
    try {
      if (!newItem.name || newItem.vendorId === -1) {
        showNotification('error', 'Missing required data');
        setIsLoading(false);
        return;
      }

      const createdAt = generateCurrentTime();
      const response = await axios.post(`${API_URL.ADMIN}/inventory`, {
        name: newItem.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        unitPrice: newItem.unitPrice,
        vendorId: newItem.vendorId,
        createdAt,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setNewItem({
        name: '',
        quantity: 0,
        vendorId: -1,
        unit: 'bags',
        unitPrice: 0,
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to add inventory: ', error);
      showNotification('error', 'Fail to add inventory: ' + error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <AddVendor
        open={isOpenAddVendor}
        onClose={() => setIsOpenAddVendor(false)}
        showNotification={showNotification}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal>
          <ModalHead
            heading="Add Inventory"
            buttonProps={{ loading: isLoading }}
            buttonLabel="ADD"
            onClose={onClose}
            onClick={handleAddInventory}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Name</Typography>
              <TextField
                fullWidth
                placeholder="Enter item name..."
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Quantity</Typography>
              <TextField
                fullWidth
                placeholder="Enter item quantity..."
                type="number"
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem({ ...newItem, quantity: +e.target.value })
                }
              />
            </Box>

            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Vendor</Typography>
              <Select
                value={newItem.vendorId}
                onChange={(e) =>
                  setNewItem({ ...newItem, vendorId: +e.target.value })
                }
              >
                <MenuItem value={-1} disabled>
                  -- Choose a vendor --
                </MenuItem>
                <MenuItem onClick={() => setIsOpenAddVendor(true)}>
                  + Create new vendor
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
                value={newItem.unit}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
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
                value={newItem.unitPrice}
                onChange={(e) =>
                  setNewItem({ ...newItem, unitPrice: +e.target.value })
                }
              />
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
