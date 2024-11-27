import {
  AlertColor,
  Box,
  Divider,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
// import { units } from '@/app/lib/constant';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { generateCurrentTime } from '@/app/utils/time';
import { SWRFetchData } from '@/app/utils/db';
import AddVendor from './AddVendor';
import VendorSearch from '../../Autocomplete/VendorSearch';
import { IVendor } from '@/app/utils/type';
import UnitRadio from '../../Radio/UnitRadio';

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
  const [newVendorItems, setNewVendorItems] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<IVendor[]>([]);

  const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);

  useEffect(() => {
    // Whenever selected vendors change then set new vendor items
    if (selectedVendors.length > 0) {
      const newVItems = selectedVendors.map((vendor) => {
        const existedInNewVendorItems = newVendorItems.find(
          (item) => item.vendorId === vendor.id,
        );

        if (existedInNewVendorItems) {
          return existedInNewVendorItems;
        }

        return {
          vendorId: vendor.id,
          vendor: vendor,
          name: vendor.name,
          quantity: 0,
          units: [],
        };
      });

      setNewVendorItems(newVItems);
    }
  }, [selectedVendors]);

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

  const handleOnChangeVendorSearch = (newValue: any) => {
    setSelectedVendors(newValue);
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
              <Typography variant="h6">Vendor</Typography>
              <VendorSearch
                vendors={vendors?.data || []}
                value={selectedVendors}
                onChange={(e: any, newValue: any) =>
                  handleOnChangeVendorSearch(newValue)
                }
              />
            </Box>

            {newVendorItems.map((item: any, index: number) => (
              <Box key={index} display="flex" flexDirection="column" gap={2}>
                <Typography variant="h6">{item.vendor.name}</Typography>
                <Box display="flex" gap={1} flexDirection="column">
                  <UnitRadio units={item.units} />
                </Box>
              </Box>
            ))}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
