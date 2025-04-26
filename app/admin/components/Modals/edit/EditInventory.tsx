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
import { API_URL } from '@/app/utils/enum';
import { SWRFetchData } from '@/app/utils/db';
import { IInventoryItem, IVendor } from '@/app/utils/type';
import axios from 'axios';
import VendorSearch from '../../Autocomplete/VendorSearch';
import AddUnit from '../add/AddUnit';
import EditUnit from './EditUnit';
import UnitRadio from '../../Radio/UnitRadio';
import ErrorComponent from '../../ErrorComponent';
import { generateCurrentTime } from '@/app/utils/time';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SellIcon from '@mui/icons-material/Sell';
import { useRouter } from 'next/navigation';
// import DisplayListingCategory from '../DisplayListingCategory';

interface IProps {
  open: boolean;
  onClose: () => void;
  inventoryItem: IInventoryItem | any;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditInventory({
  open,
  onClose,
  inventoryItem,
  showNotification,
}: IProps) {
  // const [anchorListingPopover, setAnchorListingPopover] = useState<any>(null);
  const [addUnitProps, setAddUnitProps] = useState<any>({
    open: false,
    selectedVendorId: -1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editUnit, setEditUnit] = useState<any>({
    open: false,
    unit: null,
    unitIndex: -1,
    selectedVendorId: -1,
  });
  const [updatedItem, setUpdatedItem] = useState<any>(inventoryItem);
  const [updatedVendorItems, setUpdatedVendorItems] = useState<any[]>(
    inventoryItem.vendorItem,
  );
  const [selectedVendors, setSelectedVendors] = useState<IVendor[]>([]);

  const [vendors] = SWRFetchData(`${API_URL.ADMIN}/vendors`);
  const router = useRouter();

  useEffect(() => {
    if (inventoryItem) {
      setUpdatedItem(inventoryItem);

      const vendorItems = inventoryItem.vendorItem.map((item: any) => {
        const itemUnits = item.unit.map((unit: any) => {
          return {
            ...unit,
            vendorId: item.vendorId,
          };
        });

        return {
          id: item.id,
          vendorId: item.vendorId,
          vendor: item.vendor,
          name: item.vendor.name,
          quantity: item.quantity,
          units: itemUnits,
        };
      });

      const vendors = vendorItems.map((item: any) => {
        return item.vendor;
      });

      setUpdatedVendorItems(vendorItems);
      setSelectedVendors(vendors);
    }
  }, [inventoryItem]);

  useEffect(() => {
    // Whenever selected vendors change then set new vendor items
    if (selectedVendors.length > 0) {
      const newVItems = selectedVendors.map((vendor) => {
        const existedInNewVendorItems = updatedVendorItems.find(
          (item: any) => item.vendorId === vendor.id,
        );

        if (existedInNewVendorItems) {
          return {
            ...existedInNewVendorItems,
            units: existedInNewVendorItems.units,
          };
        }

        return {
          vendorId: vendor.id,
          vendor: vendor,
          name: vendor.name,
          quantity: 0,
          units: [],
        };
      });

      setUpdatedVendorItems(newVItems);
    }
  }, [selectedVendors]);

  const handleUpdate = async () => {
    setIsLoading(true);

    if (updatedVendorItems.length === 0) {
      showNotification('error', 'Please add at least one vendor');
      setIsLoading(false);
      return;
    }

    if (updatedVendorItems.some((item: any) => item.units.length === 0)) {
      showNotification('error', 'Please add at least one unit for each vendor');
      setIsLoading(false);
      return;
    }

    const updatedAt = generateCurrentTime();
    try {
      const response = await axios.put(`${API_URL.ADMIN}/inventory`, {
        id: inventoryItem.id,
        ...updatedItem,
        // color: color.hex,
        // name: updatedItem.name,
        vendorItems: updatedVendorItems,
        updatedAt,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to save update: ', error);
      showNotification('error', 'Fail to save update: ' + error);
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

    const existingVendorItem = updatedVendorItems.find(
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

    const newVendorItemsWithNewUnit = updatedVendorItems.map((item) => {
      if (item.vendorId === addUnitProps.selectedVendorId) {
        return {
          ...item,
          units: [
            ...(item?.units || []),
            {
              ...newValue,
              vendorId: addUnitProps.selectedVendorId,
              vendorItemId: addUnitProps.selectedVendorId,
            },
          ],
        };
      }
      return item;
    });

    setUpdatedVendorItems(newVendorItemsWithNewUnit);
    setAddUnitProps(() => ({ open: false, selectedVendorId: -1 }));
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

    const existingVendorItem = updatedVendorItems.find(
      (item) => item.vendorId === selectedVendorId,
    );

    const newUnits = existingVendorItem?.units?.filter((item: any) => {
      return removedUnit.unit !== item.unit && removedUnit.ratio !== item.ratio;
    });

    const newVendorItemsWithNewUnit = updatedVendorItems.map((item) => {
      if (item.vendorId === selectedVendorId) {
        return {
          ...item,
          units: newUnits,
        };
      }
      return item;
    });

    setUpdatedVendorItems(newVendorItemsWithNewUnit);
  };

  const updateUnit = (updatedUnit: any, updatedIndex: number) => {
    if (editUnit.vendorId === -1) {
      showNotification('error', 'Missing vendor id');
      return;
    }

    const existingVendorItem = updatedVendorItems.find(
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

    const newVendorItemsWithNewUnit = updatedVendorItems.map((item) => {
      if (item.vendorId === editUnit.vendorId) {
        return {
          ...item,
          units: newUnits,
        };
      }
      return item;
    });

    setUpdatedVendorItems(newVendorItemsWithNewUnit);
  };

  return (
    <>
      <AddUnit
        addUnit={addUnit}
        open={addUnitProps.open}
        onClose={() =>
          setAddUnitProps(() => ({ open: false, selectedVendorId: -1 }))
        }
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
      {/* <DisplayListingCategory
        anchorEl={anchorListingPopover}
        listing={inventoryItem?.listingCategories || []}
      /> */}
      {/* <Button onClick={() => setOpen(true)}>Edit</Button> */}
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Inventory"
            buttonLabel="EDIT"
            buttonProps={{ loading: isLoading }}
            onClose={onClose}
            onClick={handleUpdate}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Box
              display="flex"
              justifyContent="space-between"
              // onMouseOver={(event: any) => {
              //   if (anchorListingPopover) {
              //     setAnchorListingPopover(null);
              //   } else {
              //     setAnchorListingPopover(event.currentTarget)
              //   }
              // }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <SellIcon />
                <Typography>
                  {inventoryItem.listingCategories?.length} listing items
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  router.push(`/admin/bulk/selling-items/${inventoryItem.id}`)
                }
              >
                <Box display="flex" alignItems="center">
                  Bulk Listing Item Edit
                  <ArrowForwardIosIcon />
                </Box>
              </Button>
            </Box>

            {/* <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Appearance:</Typography>
                <ItemButton
                  item={{ ...updatedItem, price: 15.5 }}
                  onClick={() => {}}
                  style={{ width: 'fit-content', maxWidth: 300 }}
                  containerStyle={{ backgroundColor: color.hex }}
                />
                <Box display="flex" gap={1} alignItems="center">
                  {color.hex !== inventoryItem.color && (
                    <Button
                      onClick={() =>
                        setColor(
                          handleResetColor(inventoryItem.color || '#e3f2fd'),
                        )
                      }
                    >
                      Reset
                    </Button>
                  )}
                  <IconButton
                    color="primary"
                    onClick={() => setIsEditColor(!isEditColor)}
                  >
                    {isEditColor ? <EditOffIcon /> : <EditIcon />}
                  </IconButton>
                </Box>
              </Box>

              {isEditColor && (
                <ColorPicker
                  height={100}
                  color={color}
                  onChange={(color: any) => setColor(color)}
                  // hideAlpha
                  hideInput={['hsv', 'rgb']}
                />
              )}
            </Box> */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">Tax</Typography>
              <Divider />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mt={1}
              >
                <Typography variant="subtitle1">PST (7%)</Typography>
                <Switch
                  checked={updatedItem?.hasPST}
                  onChange={(e: any) =>
                    setUpdatedItem((prevState: any) => ({
                      ...prevState,
                      hasPST: e.target.checked,
                    }))
                  }
                />
              </Box>

              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1">GST (5%)</Typography>
                <Switch
                  checked={updatedItem?.hasGST}
                  onChange={(e: any) =>
                    setUpdatedItem((prevState: any) => ({
                      ...prevState,
                      hasGST: e.target.checked,
                    }))
                  }
                />
              </Box>
            </Box>
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
              <Typography variant="h6">Vendor</Typography>
              <VendorSearch
                vendors={vendors?.data || []}
                value={selectedVendors}
                onChange={(e: any, newValue: any) =>
                  handleOnChangeVendorSearch(newValue)
                }
              />
            </Box>

            {updatedVendorItems.map((item: any, index: number) => (
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
                  {item?.units?.length > 0 ? (
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
