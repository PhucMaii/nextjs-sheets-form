import React, { useMemo, useState } from 'react';
import {
  Grid,
  Typography,
  Divider,
  Autocomplete,
  TextField,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import { Trash2Icon } from 'lucide-react';
import { ICreditItem } from '@/app/utils/type';
import ConfirmModal from '../Modals/ConfirmModal';
import { ShowNotificationType } from '@/hooks/useNotification';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { useParams } from 'next/navigation';

interface IProps {
  item: ICreditItem;
  categoryItems: any[];
  creditItems: ICreditItem[];
  setCreditItems: (items: ICreditItem[]) => void;
  baseItems?: ICreditItem[];
  refetchCreditReport?: () => void;
  showNotification?: ShowNotificationType;
}

export default function CreditItem({
  item,
  categoryItems,
  creditItems,
  setCreditItems,
  baseItems,
  refetchCreditReport,
  showNotification,
}: IProps) {
  const { companyId }: any = useParams();
  const [confirmDeleteProps, setConfirmDeleteProps] = useState<{
    open: boolean;
    id: number;
  }>({
    open: false,
    id: 0,
  });

  const handleRemoveCreditItem = async (id: number) => {
    if (typeof id !== 'number') {
      setCreditItems(
        creditItems.filter((creditItem: ICreditItem) => creditItem.id !== id),
      );
      return;
    }

    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, `/credit-reports/items?id=${id}`),
      );
      if (response.data.error) {
        showNotification?.('error', response.data.error);
        return;
      }

      showNotification?.('success', response.data.message);
      setCreditItems(
        creditItems.filter((creditItem: ICreditItem) => creditItem.id !== id),
      );
      refetchCreditReport?.();
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification?.(
        'error',
        'There was an error: ' + error.response.data.error,
      );
    }
  };

  const updateFlag = useMemo(() => {
    if (!baseItems) {
      return null;
    }

    const baseItem = baseItems.find(
      (baseItem: ICreditItem) => baseItem.id === item.id,
    );
    if (!baseItem) {
      return 'New';
    }

    if (
      baseItem.orderedItem.price !== item.price ||
      baseItem.orderedItem.quantity !== item.quantity
    ) {
      return 'Edited';
    }

    return null;
  }, [baseItems, item]);

  return (
    <>
      {showNotification && (
        <ConfirmModal
          open={confirmDeleteProps.open}
          onClose={() => setConfirmDeleteProps({ open: false, id: 0 })}
          title="Are you sure to delete this credit item?"
          handleSubmit={() => handleRemoveCreditItem(item.id)}
          showNotification={showNotification}
          color="error"
          buttonLabel="Yes, I'm sure"
        />
      )}
      <Grid key={item.id} container spacing={2}>
        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>
        {updateFlag && (
          <Grid item xs={12}>
            <Typography variant="caption" fontWeight="bold" color="info">
              {updateFlag}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          <Autocomplete
            options={categoryItems || []}
            getOptionLabel={(option: any) => option.name}
            filterOptions={(options, state) => {
              console.log({ options, state }, 'options in filterOptions');
              return options.filter((option: any) => {
                return option.name
                  .toLowerCase()
                  .includes(state.inputValue.toLowerCase());
              });
            }}
            renderInput={(params) => <TextField {...params} label="Item" />}
            value={item.categoryItem}
            onChange={(e, newValue: any) => {
              setCreditItems(
                creditItems.map((creditItem: ICreditItem | any) =>
                  creditItem.id === item.id
                    ? {
                        ...creditItem,
                        categoryItem: newValue,
                        actualPrice: newValue.price,
                        orderedItem: {
                          ...newValue,
                          isShowDiscount: true,
                          prevPrice: newValue.price,
                          name: `${newValue.name} CREDIT`,
                        },
                        name: `${newValue.name} CREDIT`,
                        price: 0,
                        inventoryItemId: newValue.inventoryItemId,
                        inventoryItem: newValue.inventoryItem,
                        priceDifference: newValue.price,
                      }
                    : creditItem,
                ),
              );
            }}
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            label="Quantity"
            value={item.quantity}
            onChange={(e) => {
              setCreditItems(
                creditItems.map((creditItem: ICreditItem | any) =>
                  creditItem.id === item.id
                    ? {
                        ...creditItem,
                        quantity: Number(e.target.value),
                      }
                    : creditItem,
                ),
              );
            }}
            sx={{ width: '100%' }}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography>Qty</Typography>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <TextField
            label="Price"
            value={item.price}
            onChange={(e) => {
              setCreditItems(
                creditItems.map((creditItem: ICreditItem | any) =>
                  creditItem.id === item.id
                    ? {
                        ...creditItem,
                        price: Number(e.target.value),
                      }
                    : creditItem,
                ),
              );
            }}
            sx={{ width: '100%' }}
            type="number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography>$</Typography>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    color="error"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    ${item?.actualPrice}
                  </Typography>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={1}>
          <Box display="flex" justifyContent="center">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteProps({ open: true, id: item.id });
              }}
              color="error"
            >
              <Trash2Icon style={{ width: 20, height: 20 }} />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
