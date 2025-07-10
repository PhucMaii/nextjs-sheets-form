'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
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
import { ShadowSection } from '../reports/styled';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { InfoIcon, Trash2Icon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import useNotification from '@/hooks/useNotification';
import { units } from '@/app/lib/constant';
import UnitSearch from '../components/Autocomplete/UnitSearch';
import useModalSelect from '@/hooks/select/useModalSelect';
import { LoadingButton } from '@mui/lab';
import BackButton from '../components/BackButton';

interface InventoryTemplateProps {
  onSubmit: (params: any) => Promise<void>;
  buttonLabel: string;
  defaultInventoryItem?: any;
  defaultSelectedVendors?: any[];
  defaultSellingItems?: any[];
  title: string;
}

const InventoryTemplate = ({
  onSubmit,
  buttonLabel,
  defaultInventoryItem,
  defaultSelectedVendors,
  defaultSellingItems,
  title,
}: InventoryTemplateProps) => {
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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/categories'),
      );
      return response.data.data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await axios.get(getAdminApiUrl(companyId, '/vendors'));
      return response.data.data;
    },
  });

  const { showNotification, NotificationComp } = useNotification();

  const handleOnSelectVendors = (vendors: any[]) => {
    const vendorsWithUnits = vendors.map((vendor) => {
      if (!vendor.units || vendor.units.length === 0) {
        return {
          ...vendor,
          vendorId: vendor.id,
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

  const handleOnSelectCategories = (newCategories: any[]) => {
    const sellingItemWithCategories = newCategories.map((category) => {
      if (category.isItem) {
        return category;
      }

      return {
        id: category.id,
        categoryId: category.id,
        category,
        itemId: crypto.randomUUID(),
        name: newInventoryItem?.name || '',
        price: newInventoryItem?.price || 0,
        inventoryUnit: selectedVendors[0]?.units[0] || null,
        isShowDiscount: false,
        prevPrice: 0,
        availability: true,
        typeId: newInventoryItem.typeId,
        sku: newInventoryItem.sku,
        hasGST: newInventoryItem.hasGST,
        hasPST: newInventoryItem.hasPST,
        isItem: true,
      };
    });

    setSelectedSellingItems(sellingItemWithCategories);
  };

  const {
    handleOpen: handleOpenVendorSelection,
    selectedItems: selectedVendors,
    setSelectedItems: setSelectedVendors,
    SelectionModal: VendorSelectionModal,
  } = useModalSelect(
    'Vendor',
    vendors || [],
    handleOnSelectVendors,
    defaultSelectedVendors || null,
  );

  const {
    handleOpen: handleOpenCategorySelection,
    selectedItems: selectedSellingItems,
    setSelectedItems: setSelectedSellingItems,
    SelectionModal: CategorySelectionModal,
  } = useModalSelect(
    'Category',
    categories || [],
    handleOnSelectCategories,
    defaultSellingItems || null,
  );

  const uniqueRatioUnits = useMemo(() => {
    // get all the units from the selected vendors and filter out the duplicate units
    const listOfUnits = selectedVendors.flatMap((vendor) => vendor.units);
    const uniqueUnits = listOfUnits.filter(
      (unit, index, self) =>
        self.findIndex((t) => t.ratio === unit.ratio) === index,
    );
    return uniqueUnits;
  }, [selectedVendors]);

  const [newInventoryItem, setNewInventoryItem] = useState<any>(
    defaultInventoryItem || {
      name: '',
      sku: '',
      typeId: -1,
    },
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (defaultInventoryItem) {
      console.log(defaultInventoryItem, 'defaultInventoryItem');
      setNewInventoryItem(defaultInventoryItem);
    }
  }, [defaultInventoryItem]);

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
    value: string | number,
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

  const onChangeSellingItem = (
    itemId: string,
    field: string,
    value: string | number,
  ) => {
    const newSelectedSellingItems = selectedSellingItems.map((item) => {
      if (item.itemId === itemId) {
        console.log('item', item);
        console.log('field', field);
        console.log('value', value);
        return { ...item, [field]: value };
      }
      return item;
    });
    setSelectedSellingItems(newSelectedSellingItems);
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

  const onDeleteSellingItem = (itemId: string) => {
    const newSelectedSellingItems = selectedSellingItems.filter(
      (item) => item.itemId !== itemId,
    );
    setSelectedSellingItems(newSelectedSellingItems);
  };

  const onChangeVendor = (vendorId: number, field: string, value: string) => {
    const newSelectedVendors = selectedVendors.map((vendor) => {
      if (vendor.id === vendorId) {
        return { ...vendor, [field]: value };
      }
      return vendor;
    });
    setSelectedVendors(newSelectedVendors);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onSubmit({
        newInventoryItem,
        selectedVendors,
        selectedSellingItems,
      });
      // const response = await axios.post(
      //   getAdminApiUrl(companyId, '/inventory'),
      //   {
      //     name: newInventoryItem.name,
      //     sku: newInventoryItem.sku,
      //     typeId: newInventoryItem.typeId,
      //     hasGST: newInventoryItem.hasGST,
      //     hasPST: newInventoryItem.hasPST,
      //     vendorItems: selectedVendors,
      //     sellingItems: selectedSellingItems,
      //   },
      // );

      // if (response.data.error) {
      //   showNotification('error', response.data.error);
      //   return;
      // }

      // showNotification('success', 'Inventory item created successfully');
      // router.push(`/admin/${companyId}/inventory`);
    } catch (error: any) {
      console.log('Fail to create inventory item: ', error);
      showNotification('error', 'Fail to create inventory item: ' + error);
    } finally {
      setIsLoading(false);
    }
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
      {CategorySelectionModal()}

      <Box display="flex" alignItems="center" justifyContent="space-between">
        <BackButton />

        <LoadingButton
          color="primary"
          variant="contained"
          onClick={handleSubmit}
          loading={isLoading}
        >
          {buttonLabel}
        </LoadingButton>
      </Box>
      <Typography variant="h5">{title}</Typography>

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
            disabled={!newInventoryItem.name}
          >
            + Add Vendor
          </Button>
        </Box>

        {/* Vendor Items */}
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {selectedVendors.map((vendor) => (
            <Box key={vendor.id}>
              <Box display="flex" alignItems="center" gap={1} sx={{ my: 1 }}>
                <Typography fontWeight={600}>{vendor.name}</Typography>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <FormControl>
                  <InputLabel htmlFor="vendor-name-input">
                    Supplier SKU
                  </InputLabel>
                  <OutlinedInput
                    id="vendor-supplier-sku-input"
                    label="Supplier SKU"
                    value={vendor?.supplierSku || ''}
                    onChange={(e) =>
                      onChangeVendor(vendor.id, 'supplierSku', e.target.value)
                    }
                  />
                </FormControl>
              </Box>
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
                          value={unit?.unit || ''}
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
                                +e.target.value,
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
                            value={unit?.unitPrice || 0}
                            fullWidth
                            type="number"
                            onChange={(e) =>
                              onChangeUnit(
                                vendor.id,
                                unit.id,
                                'unitPrice',
                                +e.target.value,
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
              <Button
                fullWidth
                onClick={() => onAddUnit(vendor.id)}
                sx={{ mt: 1 }}
              >
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
          <Button
            color="primary"
            onClick={handleOpenCategorySelection}
            disabled={selectedVendors.length === 0}
          >
            + Add Category
          </Button>
        </Box>

        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          {selectedSellingItems.map((item) => (
            <Box key={item.id}>
              <Typography fontWeight={600}>{item.category.name}</Typography>
              <Grid container alignItems="center" spacing={1} sx={{ my: 0.5 }}>
                <Grid item xs={12} md={3.8}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="price-input">Name</InputLabel>
                    <OutlinedInput
                      id="name-input"
                      label="Name"
                      value={item.name}
                      onChange={(e) =>
                        onChangeSellingItem(item.itemId, 'name', e.target.value)
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
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        onChangeSellingItem(
                          item.itemId,
                          'price',
                          +e.target.value,
                        )
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3.8}>
                  <Select
                    value={JSON.stringify(item.inventoryUnit)}
                    fullWidth
                    onChange={(e) =>
                      onChangeSellingItem(
                        item.itemId,
                        'inventoryUnit',
                        JSON.parse(e.target.value),
                      )
                    }
                  >
                    {uniqueRatioUnits.map((unit) => (
                      <MenuItem key={unit.id} value={JSON.stringify(unit)}>
                        1:{unit.ratio} - {unit.unit}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item xs={12} md={0.4} textAlign="right">
                  <IconButton onClick={() => onDeleteSellingItem(item.itemId)}>
                    <Trash2Icon
                      style={{ width: 20, height: 20, color: grey[700] }}
                    />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          ))}
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

export default InventoryTemplate;
