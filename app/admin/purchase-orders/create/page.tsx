'use client';
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IVendor } from '@/app/utils/type';
import useNotification from '@/hooks/useNotification';
import axios from 'axios';
import { API_URL, PO_STATUS } from '@/app/utils/enum';
import { ShadowSection } from '../../reports/styled';
import { generateRecommendDate } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trash2Icon } from 'lucide-react';

export default function CreatePO() {
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [po, setPO] = useState<any>({
    status: PO_STATUS.ON_HOLD,
    discount: 0,
    totalCost: 0,
    tax: 0,
    subtotal: 0,
    note: '',
  });
  const [selectedVendor, setSelectedVendor] = useState<IVendor | null>(null);

  const mdUp = useMediaQuery((theme: any) => theme.breakpoints.up('md'));
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const xlUp = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));

  const { date: estArrival, SelectDate } = useSelectDate(
    generateRecommendDate(),
  );
  const { showNotification, NotificationComp } = useNotification();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/vendors`);

      if (response.data.data) {
        setVendors(response.data.data);
      }
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Box
        sx={{
          width: xlUp ? 1200 : lgUp ? 800 : mdUp ? 600 : '100%',
          mx: 'auto',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="semibold">
            Create Purchase Order
          </Typography>
        </Box>

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
              isOptionEqualToValue={(option, value) => option.id === value.id}
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
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Search Items</Typography>
            {/* <OutlinedInput 
                  size="small"
                  placeholder="Search Items"
                  sx={{ width: '100%' }}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                /> */}
            <Autocomplete
              size="small"
              options={selectedVendor?.vendorItem || []}
              getOptionLabel={(option) => option?.inventoryItem?.name || ''}
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={key} {...optionProps}>
                    <FormControlLabel
                      label={option?.inventoryItem?.name}
                      control={<Checkbox checked={selected} />}
                    />
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search Items" />
              )}
              multiple
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => {
                setPO({
                  ...po,
                  items: newValue,
                });
              }}
              disableCloseOnSelect
            />
          </Box>

          {/* Display items */}
          <Box display="flex" flexDirection="column" gap={1}>
            {po?.items &&
              po?.items.length > 0 &&
              po?.items.map((item: any) => {
                return (
                  <Box
                    key={item.id}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                  >
                    <Grid
                      container
                      key={item.id}
                      display="flex"
                      alignItems="center"
                      gap={1}
                      spacing={1}
                    >
                      <Grid item xs={12} lg={3}>
                        <Typography variant="h6">
                          {item?.inventoryItem?.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={3.8} lg={1.5}>
                        <OutlinedInput
                          size="small"
                          placeholder="Quantity"
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                      <Grid item xs={3.8} lg={1.5}>
                        <OutlinedInput
                          size="small"
                          placeholder="Cost"
                          sx={{ width: '100%' }}
                          startAdornment={
                            <InputAdornment position="start">
                              <Typography>$</Typography>
                            </InputAdornment>
                          }
                        />
                      </Grid>
                      <Grid item xs={3.8} lg={1.5}>
                        <OutlinedInput
                          size="small"
                          placeholder="Tax"
                          sx={{ width: '100%' }}
                          startAdornment={
                            <InputAdornment position="start">
                              <Typography>$</Typography>
                            </InputAdornment>
                          }
                        />
                      </Grid>
                      <Grid item xs={10} lg={3} textAlign="right">
                        <Typography>Total: $50</Typography>
                      </Grid>
                      <Grid item xs={1} lg={0.5} textAlign="right">
                        <IconButton>
                          <Trash2Icon />
                        </IconButton>
                      </Grid>
                    </Grid>

                    <Divider />
                  </Box>
                );
              })}
          </Box>
          {/* Note */}
          {/* Cost Summary */}
        </ShadowSection>
      </Box>
    </Sidebar>
  );
}
