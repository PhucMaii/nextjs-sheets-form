import {
  AlertColor,
  Box,
  Button,
  Divider,
  Modal,
  Switch,
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
import ErrorComponent from '../../ErrorComponent';
import AddUnit from './AddUnit';
import EditUnit from '../edit/EditUnit';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function AddInventory({
  open,
  onClose,
  showNotification,
}: IProps) {
  const [addUnitProps, setAddUnitProps] = useState<any>({
    open: false,
    selectedVendorId: -1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenAddVendor, setIsOpenAddVendor] = useState<boolean>(false);
  const [editUnit, setEditUnit] = useState<any>({
    open: false,
    unit: null,
    unitIndex: -1,
    selectedVendorId: -1,
  });
  const [newItem, setNewItem] = useState<any>({
    name: '',
    hasPST: false,
    hasGST: false,
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
    } else {
      setNewVendorItems([]);
    }
  }, [selectedVendors]);

  const handleAddInventory = async () => {
    setIsLoading(true);
    try {
      if (!newItem.name) {
        showNotification('error', 'Missing required data');
        setIsLoading(false);
        return;
      }

      const createdAt = generateCurrentTime();
      const response = await axios.post(`${API_URL.ADMIN}/inventory`, {
        name: newItem.name,
        hasPST: newItem.hasPST,
        hasGST: newItem.hasGST,
        vendorItems: newVendorItems,
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

  const addUnit = (newValue: any) => {
    if (addUnitProps.selectedVendorId === -1) {
      showNotification('error', 'Missing required data');
      return;
    }

    const existingVendorItem = newVendorItems.find(
      (item) => item.vendorId === addUnitProps.selectedVendorId,
    );

    if (existingVendorItem?.units?.length === 0 && newValue.ratio !== 1) {
      showNotification('error', 'New Item Required Ratio of 1');
      return;
    }

    const unitRatioExist = existingVendorItem?.units?.find((unit: any) => {
      return newValue.ratio === unit.ratio;
    });

    if (unitRatioExist) {
      showNotification('error', 'Unit ratio already exists');
      return;
    }

    const unitNameExist = existingVendorItem?.units?.find((unit: any) => {
      return newValue.unit === unit.unit;
    });

    if (unitNameExist) {
      showNotification('error', 'Unit name already exists');
      return;
    }

    const newVendorItemsWithNewUnit = newVendorItems.map((item) => {
      if (item.vendorId === addUnitProps.selectedVendorId) {
        return {
          ...item,
          units: [
            ...item.units,
            { ...newValue, vendorId: addUnitProps.selectedVendorId },
          ],
        };
      }
      return item;
    });

    setAddUnitProps({ open: false, selectedVenorId: -1 });
    setNewVendorItems(newVendorItemsWithNewUnit);
  };

  const removeUnit = (removedUnit: any, selectedVendorId: number) => {
    if (selectedVendorId === -1) {
      showNotification('error', 'Missing vendor id');
      return;
    }

    if (removedUnit.ratio === 1) {
      showNotification('error', 'Inventory Item Required Ratio of 1');
      return;
    }

    const existingVendorItem = newVendorItems.find(
      (item) => item.vendorId === selectedVendorId,
    );

    const newUnits = existingVendorItem?.units?.filter((item: any) => {
      return removedUnit.unit !== item.unit && removedUnit.ratio !== item.ratio;
    });

    const newVendorItemsWithNewUnit = newVendorItems.map((item) => {
      if (item.vendorId === selectedVendorId) {
        return {
          ...item,
          units: newUnits,
        };
      }
      return item;
    });

    setNewVendorItems(newVendorItemsWithNewUnit);
  };

  const updateUnit = (updatedUnit: any, updatedIndex: number) => {
    if (editUnit.vendorId === -1) {
      showNotification('error', 'Missing vendor id');
      return;
    }

    const existingVendorItem = newVendorItems.find(
      (item) => item.vendorId === editUnit.vendorId,
    );

    if (existingVendorItem?.units?.length === 1) {
      if (updatedUnit.ratio !== 1) {
        showNotification('error', 'Inventory Item Required Ratio of 1');
        return;
      }
    }

    const unitRatioExist = existingVendorItem?.units?.find(
      (unit: any, index: number) => {
        return updatedUnit.ratio === unit.ratio && index !== updatedIndex;
      },
    );

    if (unitRatioExist) {
      showNotification('error', 'Unit ratio already exists');
      return;
    }

    const unitNameExist = existingVendorItem?.units?.find(
      (unit: any, index: number) => {
        return updatedUnit.unit === unit.unit && index !== updatedIndex;
      },
    );

    if (unitNameExist) {
      showNotification('error', 'Unit name already exists');
      return;
    }

    const newUnits = existingVendorItem?.units?.map(
      (unit: any, index: number) => {
        if (index === updatedIndex) {
          return updatedUnit;
        }

        return unit;
      },
    );

    setEditUnit({
      unit: null,
      open: false,
      vendorId: -1,
      unitIndex: -1,
    });

    const newVendorItemsWithNewUnit = newVendorItems.map((item) => {
      if (item.vendorId === editUnit.vendorId) {
        return {
          ...item,
          units: newUnits,
        };
      }
      return item;
    });

    setNewVendorItems(newVendorItemsWithNewUnit);
  };

  return (
    <>
      <AddUnit
        addUnit={addUnit}
        open={addUnitProps.open}
        onClose={() => setAddUnitProps({ open: false, selectedVendorId: -1 })}
      />
      <EditUnit
        open={editUnit.open}
        onClose={() =>
          setEditUnit((prevEditUnit: any) => ({ ...prevEditUnit, open: false }))
        }
        unit={editUnit.unit}
        updateUnit={(updatedUnit: any) =>
          updateUnit(updatedUnit, editUnit.unitIndex)
        }
      />
      <AddVendor
        open={isOpenAddVendor}
        onClose={() => setIsOpenAddVendor(false)}
        showNotification={showNotification}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
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
              <Typography variant="h6">Tax</Typography>
              <Divider />
              <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                <Typography variant="subtitle1">PST (7%)</Typography>
                <Switch checked={newItem?.hasPST} onChange={(e: any) => setNewItem((prevState: any) => ({...prevState, hasPST: e.target.checked}))} />
              </Box>

              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1">GST (5%)</Typography>
                <Switch checked={newItem?.hasGST} onChange={(e: any) => setNewItem((prevState: any) => ({...prevState, hasGST: e.target.checked}))} />
              </Box>
            </Box>
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
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">{item.vendor.name}</Typography>
                  <Button
                    onClick={() =>
                      setAddUnitProps({
                        open: true,
                        selectedVendorId: item.vendorId,
                      })
                    }
                  >
                    + New Unit
                  </Button>
                </Box>
                <Box display="flex" gap={1} flexDirection="column">
                  {item.units.length > 0 ? (
                    <UnitRadio
                      units={item.units}
                      isShowPrice
                      removeUnit={(removedUnit: any) =>
                        removeUnit(removedUnit, item.vendorId)
                      }
                      setEditUnit={setEditUnit}
                    />
                  ) : (
                    <ErrorComponent errorText="No unit found" />
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
