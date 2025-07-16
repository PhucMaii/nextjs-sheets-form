import { blue } from '@mui/material/colors';

import { blueGrey } from '@mui/material/colors';

import {
  Box,
  Typography,
  Grid,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Fade } from '@mui/material';
import {
  CalendarToday,
  Person,
  Payment,
  Receipt,
  Add,
  AttachMoney,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import { BorderSection } from '../../../reports/styled';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { useEffect, useMemo, useState } from 'react';
import ItemRow from './ItemRow';
import { gstRate, pstRate } from '@/app/lib/constant';
import { handleCheckRangeValid } from '@/pages/api/unavailable_days/POST';

export default function DetailsStep({
  transactionType,
  selectedDate,
  setSelectedDate,
  formData,
  setFormData,
  expenseItems,
  addExpenseItem,
  handleItemChange,
  removeExpenseItem,
  clearExpenseItems,
}: {
  transactionType: string;
  selectedDate: any;
  setSelectedDate: (date: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  expenseItems: any;
  addExpenseItem: () => void;
  handleItemChange: any;
  removeExpenseItem: any;
  clearExpenseItems: any;
}) {
  const { companyId }: any = useParams();
  const { data: adminsAndDrivers } = useQuery({
    queryKey: ['adminsAndDrivers'],
    queryFn: () =>
      axios
        .get(getAdminApiUrl(companyId, '/adminsAndDrivers'))
        .then((res) => res.data.data),
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () =>
      axios
        .get(getAdminApiUrl(companyId, '/paymentMethods'))
        .then((res) => res.data.data),
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () =>
      axios
        .get(getAdminApiUrl(companyId, '/vendors'))
        .then((res) => res.data.data),
  });

  const [isShowDiscountPercent, setIsShowDiscountPercent] =
    useState<boolean>(false);
  const [selectedVendorId, setSelectedVendorId] = useState<number>(-1);
  const [vendorItems, setVendorItems] = useState<any[]>([]);

  const sortedVendors = useMemo(() => {
    if (!vendors) {
      return [];
    }

    const vendorsSorted = [...vendors].sort((a: any, b: any) => {
      return a?.name?.localeCompare(b?.name);
    });

    return vendorsSorted;
  }, [vendors]);

  useEffect(() => {
    clearExpenseItems();
  }, [selectedVendorId]);

  useEffect(() => {
    if (selectedVendorId !== -1) {
      setFormData((prev: any) => ({
        ...prev,
        vendorId: selectedVendorId,
        vendor: vendors?.find((v: any) => v.id === selectedVendorId),
      }));

      if (vendors) {
        const targetVendor = vendors?.find((vendor: any) => {
          return vendor.id === selectedVendorId;
        });
        console.log(targetVendor, 'targetVendor');

        if (targetVendor) {
          setVendorItems(targetVendor?.vendorItem);
        }
      }
    }
  }, [selectedVendorId]);

  // Calculate subtotal, gst, pst, discount, total
  useEffect(() => {
    if (expenseItems.length === 0) {
      setFormData((prev: any) => ({
        ...prev,
        subTotal: 0,
        GST: 0,
        PST: 0,
        discount: 0,
        total: 0,
        discountPercentage: 0,
      }));
      return;
    }
    const subTotal =
      expenseItems.reduce((acc: number, item: any) => {
        return acc + item.total;
      }, 0) - formData.discount;

    const { gstTotal, pstTotal } = calculateTaxWithDiscount(
      formData.discountPercentage,
    );

    setFormData((prev: any) => ({
      ...prev,
      subTotal: subTotal,
      GST: gstTotal,
      PST: pstTotal,
      total: subTotal + gstTotal + pstTotal,
    }));
  }, [expenseItems]);

  useEffect(() => {
    if (formData.hasGST || formData.hasPST) {
      const gstTotal = formData.hasGST
        ? Math.round(formData.subTotal * gstRate * 100) / 100
        : 0;
      const pstTotal = formData.hasPST
        ? Math.round(formData.subTotal * pstRate * 100) / 100
        : 0;
        
      setFormData((prev: any) => ({
        ...prev,
        GST: gstTotal,
        PST: pstTotal,
        total: formData.subTotal + gstTotal + pstTotal,
      }));
    }
  }, [formData.hasGST, formData.hasPST, formData.subTotal]);

  const calculateTaxWithDiscount = (discountPercent: number = 0) => {
    const gstItems = expenseItems.filter(
      (item: any) => item?.inventoryItem?.hasGST,
    );
    const pstItems = expenseItems.filter(
      (item: any) => item?.inventoryItem?.hasPST,
    );

    const gstItemsTotalWithDiscount =
      gstItems.reduce((acc: any, item: any) => {
        return acc + item.unitPrice * item.quantity;
      }, 0) *
      (1 - discountPercent / 100);

    const pstItemsTotalWithDiscount =
      pstItems.reduce((acc: any, item: any) => {
        return acc + item.unitPrice * item.quantity;
      }, 0) *
      (1 - discountPercent / 100);

    const gstTotal =
      Math.round(gstItemsTotalWithDiscount * gstRate * 100) / 100;
    const pstTotal =
      Math.round(pstItemsTotalWithDiscount * pstRate * 100) / 100;

    return {
      gstTotal,
      pstTotal,
    };
  };

  const handleDiscountChange = (e: any, type: 'stock' | 'expense') => {
    const currentSubTotal =
      type === 'stock'
        ? expenseItems.reduce((acc: number, item: any) => {
            return acc + item.total;
          }, 0)
        : formData.initialSubTotal;

    if (isShowDiscountPercent) {
      const discount = (currentSubTotal * Number(e.target.value)) / 100;

      const { gstTotal, pstTotal } = calculateTaxWithDiscount(
        Number(e.target.value),
      );

      const newSubTotal = currentSubTotal - discount;

      setFormData((prev: any) => ({
        ...prev,
        discountPercentage: Number(e.target.value),
        discount: discount,
        subTotal: newSubTotal,
        GST: gstTotal,
        PST: pstTotal,
        total: newSubTotal + gstTotal + pstTotal,
      }));
    } else {
      const discount = Number(e.target.value);
      const discountPercentage =
        Math.round((discount / currentSubTotal) * 100 * 100) / 100;
      const { gstTotal, pstTotal } =
        calculateTaxWithDiscount(discountPercentage);

      const newSubTotal = currentSubTotal - discount;

      setFormData((prev: any) => ({
        ...prev,
        discount: discount,
        discountPercentage: discountPercentage,
        subTotal: newSubTotal,
        GST: gstTotal,
        PST: pstTotal,
        total: newSubTotal + gstTotal + pstTotal,
      }));
    }
  };

  return (
    <Fade in timeout={500}>
      <Box>
        <Typography variant="h6" gutterBottom color={blueGrey[800]}>
          {transactionType === 'stock'
            ? 'Stock Purchase Details'
            : 'Expense Details'}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Fill in the transaction information below
        </Typography>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <BorderSection sx={{ p: 3, mb: 3 }}>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CreditCardIcon color="primary" />
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Transaction Date"
                      value={selectedDate}
                      onChange={(newValue) =>
                        setSelectedDate(newValue || dayjs())
                      }
                      slots={{
                        textField: TextField,
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarToday />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Spent By</InputLabel>
                    <Select
                      value={formData.spentBy}
                      label="Spent By"
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          spentBy: e.target.value,
                        }))
                      }
                      startAdornment={
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="">
                        <em>Select who spent</em>
                      </MenuItem>
                      {adminsAndDrivers?.map((person: string) => (
                        <MenuItem key={person} value={person}>
                          {person}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethodId}
                      label="Payment Method"
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          paymentMethodId: Number(e.target.value),
                          paymentMethod: paymentMethods?.find(
                            (m: any) => m.id === Number(e.target.value),
                          ),
                        }))
                      }
                      startAdornment={
                        <InputAdornment position="start">
                          <Payment />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={-1}>
                        <em>Select payment method</em>
                      </MenuItem>
                      {paymentMethods?.map((method: any) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => {
                        const value = e.target.value as TRANSACTION_STATUS;
                        setFormData((prev: any) => ({
                          ...prev,
                          status: value,
                        }));
                      }}
                    >
                      <MenuItem value={TRANSACTION_STATUS.PAID}>Paid</MenuItem>
                      <MenuItem value={TRANSACTION_STATUS.UNPAID}>
                        Unpaid
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter transaction description..."
                  />
                </Grid>
              </Grid>
            </BorderSection>
          </Grid>

          {/* Transaction Items */}
          {transactionType === 'stock' ? (
            <Grid item xs={12}>
              <BorderSection sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Receipt color="primary" />
                    Items
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={addExpenseItem}
                    variant="outlined"
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>
                {/* <Divider sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Select Vendor
                  </Typography>
                </Divider> */}

                <FormControl fullWidth>
                  <InputLabel sx={{ mb: 1 }} htmlFor="vendor-select">
                    Vendor
                  </InputLabel>
                  <Select
                    id="vendor-select"
                    value={selectedVendorId}
                    onChange={(e) =>
                      setSelectedVendorId(Number(e.target.value))
                    }
                    fullWidth
                    sx={{ mb: 3 }}
                    label="Vendor"
                  >
                    <MenuItem value={-1}>
                      <em>Select vendor</em>
                    </MenuItem>
                    {sortedVendors.map((vendor: any) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Items
                  </Typography>
                </Divider>

                {expenseItems.map((item: any, index: number) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    isLastItem={expenseItems.length === 1}
                    vendorItems={vendorItems}
                    handleItemChange={handleItemChange}
                    removeExpenseItem={removeExpenseItem}
                    expenseItems={expenseItems}
                  />
                ))}
              </BorderSection>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <BorderSection sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <AttachMoney color="primary" />
                    Amount Details
                  </Typography>

                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.hasGST}
                          onChange={(e) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              hasGST: e.target.checked,
                            }));
                          }}
                        />
                      }
                      label="GST (5%)"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.hasPST}
                          onChange={(e) => {
                            setFormData((prev: any) => ({
                              ...prev,
                              hasPST: e.target.checked,
                            }));
                          }}
                        />
                      }
                      label="PST (7%)"
                    />
                  </Box>
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Discount"
                      type="number"
                      value={
                        isShowDiscountPercent
                          ? formData.discountPercentage
                          : formData.discount
                      }
                      onChange={(e) => handleDiscountChange(e, 'expense')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isShowDiscountPercent ? '%' : '$'}
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setIsShowDiscountPercent(
                                  !isShowDiscountPercent,
                                );
                              }}
                            >
                              <SyncAltIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Subtotal"
                      type="number"
                      value={formData?.subTotal}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          subTotal: Number(e.target.value),
                          initialSubTotal: Number(e.target.value),
                        }))
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  {formData.hasGST && (
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="GST (5%)"
                        value={formData.GST.toFixed(2)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  )}
                  {formData.hasPST && (
                    <Grid item xs={6} md={2}>
                      <TextField
                        fullWidth
                        label="PST (7%)"
                        value={formData.PST.toFixed(2)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                    </Grid>
                  )}
                  <Grid
                    item
                    xs={12}
                    md={formData.hasGST || formData.hasPST ? 3 : 7}
                  >
                    <TextField
                      fullWidth
                      label="Total Amount"
                      value={formData?.total?.toFixed(2)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: blue[50],
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </BorderSection>
            </Grid>
          )}

          {/* Tax and Totals for Stock Purchases */}
          {transactionType === 'stock' && (
            <Grid item xs={12}>
              <BorderSection sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tax Calculation & Totals
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Discount"
                      type="number"
                      value={
                        isShowDiscountPercent
                          ? formData.discountPercentage
                          : formData.discount
                      }
                      onChange={(e) => handleDiscountChange(e, 'stock')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isShowDiscountPercent ? '%' : '$'}
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setIsShowDiscountPercent(
                                  !isShowDiscountPercent,
                                );
                              }}
                            >
                              <SyncAltIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Subtotal"
                      value={formData.subTotal.toFixed(2)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="GST (5%)"
                      value={formData.GST.toFixed(2)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="PST (7%)"
                      value={formData.PST.toFixed(2)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Total Amount"
                      value={formData?.total?.toFixed(2)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: blue[50],
                          fontWeight: 'bold',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </BorderSection>
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
  );
}
