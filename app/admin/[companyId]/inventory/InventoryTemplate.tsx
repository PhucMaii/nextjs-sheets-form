'use client';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  FormControlLabel,
  InputAdornment,
  Checkbox,
} from '@mui/material';
import { ShadowSection } from '../reports/styled';
import { useQuery } from '@tanstack/react-query';
import { getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { InfoIcon, Trash2Icon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import { ShowNotificationType } from '@/hooks/useNotification';
import { units } from '@/app/lib/constant';
import UnitSearch from '../components/Autocomplete/UnitSearch';
import useModalSelect from '@/hooks/select/useModalSelect';
import { LoadingButton } from '@mui/lab';
import BackButton from '../components/BackButton';
import { InventoryItemCardSkeleton } from '../components/Inventory/InventoryItemCard';
import { Skeleton } from '@mui/material';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import VariantTable from '../items/[itemId]/VariantTable';

interface InventoryTemplateProps {
  onSubmit: (params: any) => Promise<void>;
  buttonLabel: string;
  defaultInventoryItem?: any;
  defaultSelectedVendors?: any[];
  defaultSellingItems?: any[];
  title: string;
  isInitializing?: boolean;
  showNotification: ShowNotificationType;
}

const InventoryTemplateSkeleton = () => {
  return (
    <Sidebar>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <BackButton />
        <Button variant="contained" disabled>
          Loading...
        </Button>
      </Box>
      <Typography variant="h5" mb={3}>
        Loading Inventory...
      </Typography>

      {/* Skeleton Loading States */}
      <ShadowSection>
        <Typography fontWeight={600} mb={2}>
          General Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={8}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Skeleton
              variant="rectangular"
              height={56}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
        </Grid>
      </ShadowSection>

      <ShadowSection>
        <Typography fontWeight={600} mb={2}>
          Vendors
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {[1, 2].map((index) => (
            <Box key={index}>
              <Skeleton variant="text" width={200} height={24} sx={{ mb: 1 }} />
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3.8}>
                  <Skeleton
                    variant="rectangular"
                    height={56}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={3.8}>
                  <Skeleton
                    variant="rectangular"
                    height={56}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={3.8}>
                  <Skeleton
                    variant="rectangular"
                    height={56}
                    sx={{ borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={0.4}>
                  <Skeleton variant="circular" width={40} height={40} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </ShadowSection>

      <ShadowSection>
        <Typography fontWeight={600} mb={2}>
          Assign Categories
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {[1, 2, 3].map((index) => (
            <InventoryItemCardSkeleton key={index} />
          ))}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
};

const InventoryTemplate = ({
  onSubmit,
  buttonLabel,
  defaultInventoryItem,
  defaultSelectedVendors,
  defaultSellingItems,
  title,
  isInitializing,
  showNotification,
}: InventoryTemplateProps) => {
  const { companyId }: any = useParams();
  const router = useRouter();

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
      // if the category is selected, return the category
      if (category.isItem) {
        return category;
      }

      // Check if defaultSellingItems has a category with the same id
      const defaultSellingItem = defaultSellingItems?.find(
        (item) => item.categoryId === category.id,
      );
      if (defaultSellingItem) {
        return {
          id: category.id,
          categoryId: category.id,
          category,
          itemId: crypto.randomUUID(),
          name: defaultSellingItem.name || '',
          price: defaultSellingItem.price || 0,
          inventoryUnit: defaultSellingItem.inventoryUnit || null,
          isShowDiscount: defaultSellingItem.isShowDiscount || false,
          prevPrice: defaultSellingItem.prevPrice || 0,
          availability: defaultSellingItem.availability || true,
          typeId: newInventoryItem.typeId,
          sku: newInventoryItem.sku,
          hasGST: newInventoryItem.hasGST,
          hasPST: newInventoryItem.hasPST,
          isItem: true,
        };
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

  useEffect(() => {
    if (selectedVendors.length > 0) {
      setItemToAllItems({
        name: newInventoryItem?.name || '',
        price: newInventoryItem?.price || 0,
        inventoryUnit: uniqueRatioUnits[0] || null,
      });
    }
  }, [selectedVendors, uniqueRatioUnits]);

  const [newInventoryItem, setNewInventoryItem] = useState<any>(
    defaultInventoryItem || {
      name: '',
      sku: '',
      typeId: -1,
    },
  );
  const [itemToAllItems, setItemToAllItems] = useState<any>({
    name: newInventoryItem?.name || '',
    price: newInventoryItem?.price || 0,
    unit: uniqueRatioUnits[0] || null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (defaultInventoryItem) {
      setNewInventoryItem(defaultInventoryItem);
    }
  }, [defaultInventoryItem]);

  const onAddUnit = useCallback(
    (vendorId: number) => {
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
    },
    [selectedVendors],
  );

  const onChangeUnit = useCallback(
    (
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
    },
    [selectedVendors],
  );

  const onChangeSellingItem = useCallback(
    (itemId: string, field: string, value: string | number | boolean) => {
      const newSelectedSellingItems = selectedSellingItems.map((item) => {
        if (item.itemId === itemId) {
          return { ...item, [field]: value };
        }
        return item;
      });
      setSelectedSellingItems(newSelectedSellingItems);
    },
    [selectedSellingItems],
  );

  const onDeleteUnit = (vendorId: number, unit: any) => {
    const newSelectedVendors = selectedVendors.map((vendor) => {
      if (vendor.id === vendorId) {
        if (vendor.units.length === 1) {
          showNotification('error', 'Vendor must have at least one unit');
          return vendor;
        }
        if (unit?.ratio === 1) {
          showNotification('error', 'Unit with ratio of 1 cannot be deleted');
          return vendor;
        }
        return {
          ...vendor,
          units: vendor.units.filter((u: any) => u.id !== unit.id),
        };
      }
      return vendor;
    });
    setSelectedVendors(newSelectedVendors);
  };

  const onDeleteSellingItem = useCallback(
    (itemId: string) => {
      const newSelectedSellingItems = selectedSellingItems.filter(
        (item) => item.itemId !== itemId,
      );
      setSelectedSellingItems(newSelectedSellingItems);
    },
    [selectedSellingItems],
  );

  const onChangeVendor = useCallback(
    (vendorId: number, field: string, value: string) => {
      const newSelectedVendors = selectedVendors.map((vendor) => {
        if (vendor.id === vendorId) {
          return { ...vendor, [field]: value };
        }
        return vendor;
      });
      setSelectedVendors(newSelectedVendors);
    },
    [selectedVendors],
  );

  const handleApplyToAllItems = (field: string = 'all') => {
    let newSelectedSellingItems: any[] = [];
    if (field === 'all') {
      newSelectedSellingItems = selectedSellingItems.map((item) => {
        return { ...item, ...itemToAllItems };
      });
    } else if (field === 'prevPrice') {
      newSelectedSellingItems = selectedSellingItems.map((item) => {
        return {
          ...item,
          prevPrice: itemToAllItems.prevPrice,
          isShowDiscount: itemToAllItems.isShowDiscount,
        };
      });
    } else {
      newSelectedSellingItems = selectedSellingItems.map((item) => {
        return { ...item, [field]: itemToAllItems[field] };
      });
    }
    setSelectedSellingItems(newSelectedSellingItems);
  };

  const checkBeforeSubmit = () => {
    if (newInventoryItem.name === '') {
      showNotification('error', 'Name is required');
      return false;
    }

    if (selectedVendors.length === 0) {
      showNotification('error', 'Vendors are required');
      return false;
    }

    // Check if all selling items have required fields
    const allSellingItemsHaveRequiredFields = selectedSellingItems.every(
      (item) => {
        return (
          item.name !== '' && item.price !== 0 && item.inventoryUnit !== null
        );
      },
    );

    if (!allSellingItemsHaveRequiredFields) {
      showNotification('error', 'All selling items must have required fields');
      return false;
    }

    // Check if units in one vendor are unique
    const allVendorsHaveUniqueUnits = selectedVendors.every((vendor) => {
      const uniqueUnits = vendor.units.filter(
        (unit: any, index: number, self: any) =>
          self.findIndex(
            (t: any) => t.unit === unit.unit || t.ratio === unit.ratio,
          ) === index,
      );
      return uniqueUnits.length === vendor.units.length;
    });

    if (!allVendorsHaveUniqueUnits) {
      showNotification('error', 'Units in one vendor must be unique');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!checkBeforeSubmit()) {
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit({
        newInventoryItem,
        selectedVendors,
        selectedSellingItems,
        updatedSellingItem: itemToAllItems,
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

  const renderedSellingItems = useMemo(() => {
    const renderItem = (item: any) => {
      if (item.options && item.options.length > 0) {
        const smallestOption = item.options.reduce(
          (smallest: any, current: any) => {
            return smallest.price < current.price ? smallest : current;
          },
          item.options[0],
        );

        return (
          <Box key={item.id}>
            {!isNaN(Number(item.itemId)) ? (
              // <Link
              //   href={`/admin/${companyId}/items/${item.itemId}`}
              //   style={{ width: 'fit-content' }}
              // >
              <Typography
                sx={{
                  color: 'black',
                  width: 'fit-content',
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  },
                }}
                fontWeight={600}
                onClick={() => {
                  router.push(`/admin/${companyId}/items/${item.itemId}`);
                }}
              >
                {item.category.name}
              </Typography>
            ) : (
              <Typography fontWeight={600}>{item.category.name}</Typography>
            )}
            <Grid
              container
              alignItems="center"
              spacing={1}
              sx={{
                my: 0.5,
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
              }}
            >
              <Grid item xs={12}>
                {/* <Typography fontWeight={600}>Name</Typography> */}
                <Typography>{item.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <VariantTable variants={item.options} />
              </Grid>
            </Grid>
          </Box>
        );
      }

      return (
        <Box key={item.id}>
          {!isNaN(Number(item.itemId)) ? (
            // <Link
            //   href={`/admin/${companyId}/items/${item.itemId}`}
            //   style={{ width: 'fit-content' }}
            // >
            <Typography
              sx={{
                color: 'black',
                width: 'fit-content',
                '&:hover': {
                  textDecoration: 'underline',
                  cursor: 'pointer',
                },
              }}
              fontWeight={600}
              onClick={() => {
                router.push(`/admin/${companyId}/items/${item.itemId}`);
              }}
            >
              {item.category.name}
            </Typography>
          ) : (
            // </Link>
            <Typography fontWeight={600}>{item.category.name}</Typography>
          )}
          <Grid container alignItems="center" spacing={1} sx={{ my: 0.5 }}>
            <Grid item xs={12} md={3.3}>
              <FormControl fullWidth>
                <InputLabel htmlFor="name-input">Name</InputLabel>
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
            <Grid item xs={12} md={1.5}>
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
            <Grid item xs={12} md={3.3}>
              <FormControl fullWidth>
                <InputLabel htmlFor="price-input">Price</InputLabel>
                <OutlinedInput
                  id="price-input"
                  label="Price"
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    onChangeSellingItem(item.itemId, 'price', +e.target.value)
                  }
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3.3}>
              <FormControl fullWidth>
                <InputLabel htmlFor="prev-price-input">Prev Price</InputLabel>
                <OutlinedInput
                  id="prev-price-input"
                  label="Prev Price"
                  fullWidth
                  type="number"
                  value={item?.prevPrice || 0}
                  onChange={(e) =>
                    onChangeSellingItem(
                      item.itemId,
                      'prevPrice',
                      +e.target.value,
                    )
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={item.isShowDiscount}
                            onChange={(e) =>
                              onChangeSellingItem(
                                item.itemId,
                                'isShowDiscount',
                                e.target.checked,
                              )
                            }
                          />
                        }
                        label="Show Discount"
                      />
                    </InputAdornment>
                  }
                />
              </FormControl>
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
      );
    };

    return selectedSellingItems.map((item) => (
      <Fragment key={item.id}>{renderItem(item)}</Fragment>
    ));
  }, [selectedSellingItems, uniqueRatioUnits]);

  if (isInitializing) {
    return <InventoryTemplateSkeleton />;
  }

  return (
    <Sidebar>
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
          <Grid item xs={12} textAlign="right">
            <FormControlLabel
              control={
                <Checkbox
                  checked={newInventoryItem?.isShowInventory || false}
                  onChange={(e) =>
                    setNewInventoryItem((prev: any) => ({
                      ...prev,
                      isShowInventory: e.target.checked,
                    }))
                  }
                />
              }
              label="Show Low Stock Quantity"
            />
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
                            type="number"
                            fullWidth
                            disabled={
                              index === 0 ||
                              unit?.id?.toString()?.includes('first')
                            }
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
                          onClick={() => onDeleteUnit(vendor.id, unit)}
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
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Box>
      </ShadowSection>

      {/* Assign categories to this inventory */}
      <ShadowSection>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography fontWeight={600}>Assign Categories</Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <InfoIcon style={{ width: 16, height: 16, color: grey[700] }} />
              <Typography variant="body2" color={grey[700]}>
                Variants items must be edited at item page.
              </Typography>
            </Box>
          </Box>
          <Button
            color="primary"
            onClick={handleOpenCategorySelection}
            disabled={selectedVendors.length === 0}
          >
            + Add Category
          </Button>
        </Box>

        {/* {selectedSellingItems.length > 0 && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ my: 1, justifyContent: 'flex-end' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={applyToAllItems}
                  onChange={(e) => setApplyToAllItems(e.target.checked)}
                />
              }
              label="Apply to all items"
            />
          </Box>
        )} */}

        {selectedSellingItems.length > 0 && (
          <>
            <Typography fontWeight={600} mt={2} mb={1}>
              General Item Set
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3.3}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="general-name-input">Name</InputLabel>
                  <OutlinedInput
                    id="general-name-input"
                    label="Name"
                    value={itemToAllItems.name}
                    onChange={(e) =>
                      setItemToAllItems((prev: any) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    fullWidth
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleApplyToAllItems('name')}
                        >
                          <KeyboardDoubleArrowDownIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="general-unit-input">Unit</InputLabel>
                  <Select
                    id="general-unit-input"
                    label="Unit"
                    value={JSON.stringify(itemToAllItems?.inventoryUnit || {})}
                    onChange={(e) =>
                      setItemToAllItems((prev: any) => ({
                        ...prev,
                        inventoryUnit: JSON.parse(e.target.value),
                      }))
                    }
                    fullWidth
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleApplyToAllItems('inventoryUnit')}
                        >
                          <KeyboardDoubleArrowDownIcon />
                        </IconButton>
                      </InputAdornment>
                    }
                  >
                    {uniqueRatioUnits.map((unit: any) => (
                      <MenuItem key={unit.id} value={JSON.stringify(unit)}>
                        1:{unit.ratio} - {unit.unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3.3}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="general-price-input">Price</InputLabel>
                  <OutlinedInput
                    id="general-price-input"
                    label="Price"
                    fullWidth
                    value={itemToAllItems.price}
                    type="number"
                    onChange={(e) =>
                      setItemToAllItems((prev: any) => ({
                        ...prev,
                        price: +e.target.value,
                      }))
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <Box display="flex" alignItems="center" gap={1}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={itemToAllItems.isShowDiscount}
                                onChange={(e) =>
                                  setItemToAllItems((prev: any) => ({
                                    ...prev,
                                    isShowDiscount: e.target.checked,
                                  }))
                                }
                              />
                            }
                            label="Show Discount"
                          />
                          <IconButton
                            onClick={() => handleApplyToAllItems('price')}
                          >
                            <KeyboardDoubleArrowDownIcon />
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3.9}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="general-prev-price-input">
                    Prev Price
                  </InputLabel>
                  <OutlinedInput
                    id="general-prev-price-input"
                    label="Prev Price"
                    fullWidth
                    value={itemToAllItems.prevPrice}
                    type="number"
                    onChange={(e) =>
                      setItemToAllItems((prev: any) => ({
                        ...prev,
                        prevPrice: +e.target.value,
                      }))
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={itemToAllItems.isShowDiscount}
                                onChange={(e) =>
                                  setItemToAllItems((prev: any) => ({
                                    ...prev,
                                    isShowDiscount: e.target.checked,
                                  }))
                                }
                              />
                            }
                            label="Show Discount"
                          />
                          <IconButton
                            onClick={() => handleApplyToAllItems('prevPrice')}
                          >
                            <KeyboardDoubleArrowDownIcon />
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} textAlign="right">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleApplyToAllItems('all')}
                >
                  Apply
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider flexItem sx={{ my: 1 }}>
                  Selling Items
                </Divider>
              </Grid>
            </Grid>
          </>
        )}
        <Box mt={4} display="flex" flexDirection="column" gap={2}>
          {renderedSellingItems}
        </Box>
      </ShadowSection>
    </Sidebar>
  );
};

export default InventoryTemplate;
