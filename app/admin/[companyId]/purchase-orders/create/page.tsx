'use client';
import {
  Autocomplete,
  Box,
  Button,
  // Checkbox,
  // FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IVendor } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { getAdminApiUrl, PO_STATUS } from '@/app/utils/enum';
import { ShadowSection } from '../../reports/styled';
import { generateRecommendDate } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import { gstRate, pstRate } from '@/app/lib/constant';
import AddPODiscount from '../../components/Modals/add/AddPODiscount';
import SellIcon from '@mui/icons-material/Sell';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import { POItemRow } from '../../components/POItemRow';
import SearchInventoryItems from '../../components/Modals/SearchInventoryItems';
import useDebounce from '@/hooks/useDebounce';
import { useParams } from 'next/navigation';

export default function CreatePO() {
  const { companyId }: any = useParams();
  const [creating, setCreating] = useState<any>({
    isCreating: false,
    type: 'draft',
  });
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [po, setPO] = useState<any>({
    status: PO_STATUS.DRAFT,
    discount: 0,
    totalCost: 0,
    tax: 0,
    subtotal: 0,
    note: '',
  });
  const [isOpenPODiscount, setIsOpenPODiscount] = useState<boolean>(false);
  const [isOpenModalInventoryItemSearch, setIsOpenModalInventoryItemSearch] =
    useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const debouncedSearch = useDebounce(searchKeywords, 1000);

  useEffect(() => {
    if (debouncedSearch) {
      setIsOpenModalInventoryItemSearch(true);
    }
  }, [debouncedSearch]);

  const router = useRouter();

  const { date: estArrival, SelectDate } = useSelectDate(
    generateRecommendDate(),
  );
  const { showNotification, NotificationComp } = useNotification();

  const costSummary = useMemo(() => {
    if (!po.items || po.items.length === 0) {
      return {
        subtotal: 0,
        tax: 0,
        totalCost: 0 - (po?.discount || 0),
      };
    }

    const subtotal = po.items.reduce((acc: number, item: any) => {
      return acc + item.costPerItem * item.orderedQty;
    }, 0);

    const tax = po.items.reduce((acc: number, item: any) => {
      return acc + item.tax * item.orderedQty;
    }, 0);

    const totalCost = subtotal + tax - (po?.discount || 0);

    return {
      subtotal,
      tax,
      totalCost,
    };
  }, [po]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(getAdminApiUrl(companyId, '/vendors'));

      if (response.data.data) {
        setVendors(response.data.data);
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  // const onSelectItem = (newItems: any) => {
  //   const itemWithCostAndTax = newItems.map((item: any) => {
  //     if (po?.items?.length > 0) {
  //       const existingItem = po?.items?.find(
  //         (i: any) => i.inventoryItemId === item.inventoryItemId,
  //       );

  //       if (existingItem) {
  //         return existingItem;
  //       }
  //     }

  //     const inventoryUnit = item?.unit[0];

  //     const isGST = item.inventoryItem.hasGST;
  //     const isPST = item.inventoryItem.hasPST;

  //     const tax =
  //       inventoryUnit?.unitPrice * (isGST ? gstRate : 0) +
  //       inventoryUnit?.unitPrice * (isPST ? pstRate : 0);

  //     return {
  //       ...item,
  //       orderedQty: 1,
  //       costPerItem: inventoryUnit?.unitPrice,
  //       tax,
  //       total: (inventoryUnit?.unitPrice + tax) * 1,
  //       inventoryUnit: item?.unit[0],
  //     };
  //   });

  //   setPO((prevState: any) => ({
  //     ...prevState,
  //     items: itemWithCostAndTax,
  //   }));
  // };

  console.log(po, 'PO');
  const handleCreatePO = async (isOrdered: boolean = false) => {
    setCreating((prevState: any) => ({
      ...prevState,
      isCreating: true,
      type: isOrdered ? 'ordered' : 'draft',
    }));
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/purchase-orders'),
        {
          purchaseOrder: {
            ...po,
            estArrival,
            items: po?.items?.map((item: any) => ({
              ...item,
              inventoryItemId: item?.inventoryItem?.id,
            })),
          },
          selectedVendor,
          isOrdered,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);

      setTimeout(() => {
        router.push(`/admin/${companyId}/purchase-orders`);
      }, 2500);
    } catch (error) {
      console.log(error, 'Something went wrong');
      showNotification('error', 'Something went wrong');
    } finally {
      setCreating((prevState: any) => ({
        ...prevState,
        isCreating: false,
        type: 'draft',
      }));
    }
  };

  const onAddItem = (item: any) => {
    const inventoryUnit = item?.unit[0];

    const isGST = item.hasGST;
    const isPST = item.hasPST;

    const tax =
      inventoryUnit?.unitPrice * (isGST ? gstRate : 0) +
      inventoryUnit?.unitPrice * (isPST ? pstRate : 0);

    const newItem = {
      inventoryItem: item,
      orderedQty: 1,
      costPerItem: inventoryUnit?.unitPrice,
      tax,
      total: inventoryUnit?.unitPrice + tax,
      inventoryUnit: item?.unit[0],
      unit: item?.unit,
      inventoryItemId: item?.id,
    };

    setPO((prevState: any) => ({
      ...prevState,
      items: [...(prevState?.items || []), newItem],
    }));
  };

  return (
    <Sidebar>
      <AddPODiscount
        open={isOpenPODiscount}
        onClose={() => setIsOpenPODiscount(false)}
        addDiscount={(discount: number) => {
          setPO((prevState: any) => ({
            ...prevState,
            discount,
          }));
        }}
      />

      <SearchInventoryItems
        open={isOpenModalInventoryItemSearch}
        onClose={() => setIsOpenModalInventoryItemSearch(false)}
        onAddItem={onAddItem}
        inventoryItems={
          selectedVendor?.vendorItem?.map((item: any) => ({
            ...item.inventoryItem,
            unit: item.unit,
          })) || []
        }
        defaultSearchKeywords={debouncedSearch}
      />
      {NotificationComp}
      <Box
        sx={{
          width: '90%',
          maxWidth: 1920,
          mx: 'auto',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h5" fontWeight="semibold">
              Create Purchase Order
            </Typography>

            <Box display="flex" alignItems="center" gap={1}>
              <LoadingButton
                variant="outlined"
                onClick={() => handleCreatePO(true)}
                loading={creating.isCreating && creating.type === 'ordered'}
              >
                Mark as ordered
              </LoadingButton>
              <LoadingButton
                loading={creating.isCreating && creating.type === 'draft'}
                variant="contained"
                onClick={() => handleCreatePO()}
              >
                Create Draft
              </LoadingButton>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} lg={8}>
            <ShadowSection
              sx={{ width: '100%' }}
              display="flex"
              flexDirection={'column'}
              gap={2}
            >
              {/* Vendor Selection */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Vendors</Typography>
                <Autocomplete
                  options={vendors}
                  getOptionLabel={(option) => option.name}
                  value={selectedVendor}
                  renderInput={(params) => (
                    <TextField {...params} label="Vendors" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li key={key} {...optionProps}>
                        <Typography>{option.name}</Typography>
                      </li>
                    );
                  }}
                  onChange={(event, newValue) => {
                    setSelectedVendor(newValue);
                  }}
                />
              </Box>

              {/* Est Arrival */}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography>Est. Arrival</Typography>
                {SelectDate}
              </Box>
              {/* Items */}
              <Box display="flex" flexDirection="column" gap={1} onClick={() => setIsOpenModalInventoryItemSearch(true)}>
                <Typography>Search Items</Typography>
                <TextField
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                  placeholder="Search Items"
                  onClick={() => setIsOpenModalInventoryItemSearch(true)}
                />
              </Box>

              {/* Display items */}
              <Box display="flex" flexDirection="column" gap={2}>
                {po?.items &&
                  po?.items.length > 0 &&
                  po?.items.map((item: any, index: number) => {
                    return (
                      <POItemRow
                        key={index}
                        index={index}
                        item={item}
                        isEditMode={true}
                        selectedItems={po?.items || []}
                        setSelectedItems={(items: any) => {
                          setPO((prevState: any) => ({
                            ...prevState,
                            items,
                          }));
                        }}
                      />
                    );
                  })}
              </Box>
            </ShadowSection>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* Cost Summary */}
            <ShadowSection display="flex" flexDirection="column" gap={2}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" fontWeight="semibold">
                  Cost Summary
                </Typography>

                <Button
                  startIcon={<SellIcon />}
                  onClick={() => setIsOpenPODiscount(true)}
                >
                  Discount
                </Button>
              </Box>
              {/* Note */}
              <TextField
                label="Note"
                placeholder="Leave a note..."
                multiline
                rows={2}
                sx={{ width: '100%' }}
                onChange={(e) =>
                  setPO((prevState: any) => ({
                    ...prevState,
                    note: e.target.value,
                  }))
                }
              />
              <Box display="flex" flexDirection="column" gap={1}>
                {po?.discount ? (
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Discount</Typography>
                    <Typography>-${po?.discount?.toFixed(2) || 0}</Typography>
                  </Box>
                ) : null}
                <Box display="flex" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>
                    ${costSummary?.subtotal?.toFixed(2) || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Tax</Typography>
                  <Typography>${costSummary?.tax?.toFixed(2) || 0}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Total</Typography>
                  <Typography>
                    ${costSummary?.totalCost?.toFixed(2) || 0}
                  </Typography>
                </Box>
              </Box>
            </ShadowSection>
          </Grid>
        </Grid>
      </Box>
    </Sidebar>
  );
}
