'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Button,
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  OutlinedInput,
  InputLabel,
  FormControl,
  IconButton,
} from '@mui/material';
import { ShadowSection } from '../../reports/styled';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import axios from 'axios';
import VendorSelection from '../../components/Modals/Selection/VendorSelection';
import { InfoIcon, Trash2Icon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { units } from '@/app/lib/constant';
import UnitSearch from '../../components/Autocomplete/UnitSearch';
import useModalSelect from '@/hooks/select/useModalSelect';

const CreateInventory = () => {
  const { companyId }: any = useParams();

  const { data: itemTypes } = useQuery({
    queryKey: ['itemTypes'],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/item-types'),
      );
      return response.data.data;
    },
  });

  const { showNotification, NotificationComp } = useNotification();
  const handleOnSelectVendors = (vendors: any[]) => {
    const vendorsWithUnits = vendors.map((vendor) => {
      if (!vendor.units || vendor.units.length === 0) {
        return {
          ...vendor,
          units: [
            {
              id: `first-${crypto.randomUUID()}`,
              unit: 'bags',
              ratio: 1,
              price: 0,
            },
          ],
        };
      }
      return vendor;
    });
    setSelectedVendors(vendorsWithUnits);
  };

  const {
    handleOpen: handleOpenVendorSelection,
    selectedItems: selectedVendors,
    setSelectedItems: setSelectedVendors,
    SelectionModal: VendorSelectionModal,
  } = useModalSelect('Vendor', [], handleOnSelectVendors);

  const [newInventoryItem, setNewInventoryItem] = useState<any>({
    name: '',
    sku: '',
    typeId: -1,
  });

  const [isOpenVendorSelection, setIsOpenVendorSelection] = useState(false);
  // const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  // const [units, setUnits] = useState<any[]>([]);

  const onAddUnit = (vendorId: number) => {
    const newSelectedVendors = selectedVendors.map((vendor) => {
      if (vendor.id === vendorId) {
        // the default unit name must be random different from the existing list of units
        const nonExistingUnits = units.filter(
          (unit) => !vendor.units.some((u: any) => u.unit === unit),
        );
        let randomUnit = 'bags';

        if (nonExistingUnits.length > 0) {
          randomUnit =
            nonExistingUnits[
              Math.floor(Math.random() * nonExistingUnits.length)
            ];
        }

        return {
          ...vendor,
          units: [
            ...vendor.units,
            { id: crypto.randomUUID(), unit: randomUnit, ratio: 2, price: 0 },
          ],
        };
      }
      return vendor;
    });
    setSelectedVendors(newSelectedVendors);
  };

  const onChangeUnit = (
    vendorId: number,
    unitId: number,
    field: string,
    value: string,
  ) => {
    const newSelectedVendors = selectedVendors.map((vendor) => {
      if (vendor.id === vendorId) {
        return {
          ...vendor,
          units: vendor.units.map((unit: any) =>
            unit.id === unitId ? { ...unit, [field]: value } : unit,
          ),
        };
      }
      return vendor;
    });
    setSelectedVendors(newSelectedVendors);
  };

  const onDeleteUnit = (vendorId: number, unitId: string) => {
    const newSelectedVendors = selectedVendors.map((vendor) => {
      if (vendor.id === vendorId) {
        if (vendor.units.length === 1) {
          showNotification('error', 'Vendor must have at least one unit');
          return vendor;
        }
        if (unitId.includes('first')) {
          showNotification('error', 'Unit with ratio of 1 cannot be deleted');
          return vendor;
        }
        return {
          ...vendor,
          units: vendor.units.filter((unit: any) => unit.id !== unitId),
        };
      }
      return vendor;
    });
    setSelectedVendors(newSelectedVendors);
  };

  return (
    <Sidebar>
      {NotificationComp}
      {/* <VendorSelection
        open={isOpenVendorSelection}
        onClose={() => setIsOpenVendorSelection(false)}
        selectedVendors={selectedVendors}
        setSelectedVendors={setSelectedVendors}
        fnOnSelect={handleOnSelectVendors}
      /> */}
      {VendorSelectionModal()}
      <Typography variant="h5">Create Inventory</Typography>

      {/* General Information */}
      <ShadowSection>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Tax</Typography>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Typography>GST (5%)</Typography>
              <Switch
                checked={newInventoryItem.hasGST}
                onChange={(e) =>
                  setNewInventoryItem((prev: any) => ({
                    ...prev,
                    hasGST: e.target.checked,
                  }))
                }
              />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Typography>PST (7%)</Typography>
              <Switch
                checked={newInventoryItem.hasPST}
                onChange={(e) =>
                  setNewInventoryItem((prev: any) => ({
                    ...prev,
                    hasPST: e.target.checked,
                  }))
                }
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>
          <Grid
            item
            xs={6}
            sm={8}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Name</Typography>
            <TextField
              label="Name"
              fullWidth
              value={newInventoryItem.name}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            item
            xs={6}
            sm={4}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>SKU</Typography>
            <TextField
              label="SKU"
              fullWidth
              value={newInventoryItem.sku}
              onChange={(e) =>
                setNewInventoryItem((prev: any) => ({
                  ...prev,
                  sku: e.target.value,
                }))
              }
            />
          </Grid>
          <Grid
            item
            xs={12}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Typography fontWeight={600}>Type</Typography>
            <Select
              onChange={(e) =>
                setNewInventoryItem({
                  ...newInventoryItem,
                  typeId: +e.target.value,
                })
              }
              fullWidth
              value={newInventoryItem.typeId}
            >
              <MenuItem value={-1} disabled>
                -- Choose type --
              </MenuItem>
              {itemTypes &&
                itemTypes.map((type: any) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
            </Select>
          </Grid>
        </Grid>
      </ShadowSection>

      {/* Vendor and Units */}
      <ShadowSection>
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={600}>Vendors</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon style={{ width: 16, height: 16, color: grey[700] }} />
              <Typography variant="body2" color={grey[700]}>
                Each vendor must have unit with ratio of 1.
              </Typography>
            </Box>
          </Box>
          <Button
            color="primary"
            onClick={handleOpenVendorSelection}
          >
            + Add Vendor
          </Button>
        </Box>

        {/* Vendor Items */}
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {selectedVendors.map((vendor) => (
            <Box key={vendor.id}>
              <Typography fontWeight={600}>{vendor.name}</Typography>
              <Box>
                {vendor?.units &&
                  vendor?.units.map((unit: any, index: number) => (
                    <Grid
                      container
                      key={unit.id}
                      alignItems="center"
                      spacing={2}
                      sx={{ my: 0.5 }}
                    >
                      <Grid item xs={12} md={3.8}>
                        {/* <FormControl fullWidth> */}
                        {/* <InputLabel htmlFor="unit-input">Unit</InputLabel> */}
                        <UnitSearch
                          value={unit.unit}
                          handleSelectPromptedItem={(selectedUnit: any) =>
                            onChangeUnit(
                              vendor.id,
                              unit.id,
                              'unit',
                              selectedUnit,
                            )
                          }
                          displayItems={units}
                          role={USER_ROLE.ADMIN}
                        />
                        {/* <OutlinedInput
                            id="unit-input"
                            label="Unit"
                            value={unit.unit}
                            fullWidth
                            onChange={(e) =>
                              onChangeUnit(
                                vendor.id,
                                unit.id,
                                'unit',
                                e.target.value,
                              )
                            }
                          /> */}
                        {/* </FormControl> */}
                      </Grid>
                      <Grid item xs={12} md={3.8}>
                        <FormControl fullWidth>
                          <InputLabel htmlFor="ratio-input">Ratio</InputLabel>
                          <OutlinedInput
                            id="ratio-input"
                            label="Ratio"
                            value={unit.ratio}
                            fullWidth
                            disabled={index === 0 || unit.id.includes('first')}
                            onChange={(e) =>
                              onChangeUnit(
                                vendor.id,
                                unit.id,
                                'ratio',
                                e.target.value,
                              )
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3.8}>
                        <FormControl fullWidth>
                          <InputLabel htmlFor="price-input">Price</InputLabel>
                          <OutlinedInput
                            id="price-input"
                            label="Price"
                            value={unit.price}
                            fullWidth
                            onChange={(e) =>
                              onChangeUnit(
                                vendor.id,
                                unit.id,
                                'price',
                                e.target.value,
                              )
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={0.4} textAlign="right">
                        <IconButton
                          onClick={() => onDeleteUnit(vendor.id, unit.id)}
                        >
                          <Trash2Icon
                            style={{ width: 20, height: 20, color: grey[700] }}
                          />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
              </Box>
              <Button fullWidth onClick={() => onAddUnit(vendor.id)}>
                + Add Unit
              </Button>
            </Box>
          ))}
        </Box>
      </ShadowSection>

      {/* Assign categories to this inventory */}
      <ShadowSection>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={600}>Assign Categories</Typography>
          <Button color="primary">+ Add Category</Button>
        </Box>

        {/* <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {categories.map((category) => (
            <Box key={category.id}>
              <Typography fontWeight={600}>{category.name}</Typography>
            </Box>
          ))}
        </Box> */}
      </ShadowSection>
    </Sidebar>
  );
};

export default CreateInventory;
