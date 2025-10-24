import React from 'react';
import { BorderSection } from '../../reports/styled';
import { Box, Button, Divider, Grid, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ICreditItem } from '@/app/utils/type';
import CreditItem from './CreditItem';
import ErrorComponent from '../ErrorComponent';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface IProps {
  selectedOrder: any;
  creditItems: any[];
  setCreditItems: (items: ICreditItem[]) => void;
  categoryItems: any[];
  renderCreditTypeSearch: () => React.ReactNode;
  formData: any;
  setFormData: (data: any) => void;
}

export default function ItemsAndGenInfo({
  selectedOrder,
  creditItems,
  setCreditItems,
  categoryItems,
  renderCreditTypeSearch,
  formData,
  setFormData,
}: IProps) {

  const handleAddCreditItem = () => {
    setCreditItems([
      ...creditItems as any[],
      {
        id: Date.now().toString(),
        inventoryItemId: 0,
        orderedItemId: 0,
        actualPrice: 0,
        priceDifference: 0,
        quantity: 1,
        price: 0,
      },
    ]);
  };

  return (
    <BorderSection display="flex" flexDirection="column" gap={1}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Typography variant="subtitle1">Credit Items</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Add />}
          disabled={!selectedOrder}
          onClick={handleAddCreditItem}
        >
          Add Item
        </Button>
      </Box>

      {creditItems.length > 0 ? (
        <>
          {creditItems.map((item: ICreditItem | any) => {
            return (
              <CreditItem
                key={item.id}
                item={item}
                categoryItems={categoryItems || []}
                creditItems={creditItems as ICreditItem[]}
                setCreditItems={setCreditItems}
              />
            );
          })}
        </>
      ) : (
        <ErrorComponent errorText="Add the items you want to credit" />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">General Information</Typography>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={6}>
          {renderCreditTypeSearch()}
        </Grid>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Reported Date"
              value={dayjs(formData.reportedDate)}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  reportedDate: value?.toISOString(),
                })
              }
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Reason"
            fullWidth
            value={formData.reason}
            onChange={(e: any) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            multiline
            rows={4}
            placeholder="Please provide a detailed description of the credit report"
          />
        </Grid>
      </Grid>
    </BorderSection>
  );
}
