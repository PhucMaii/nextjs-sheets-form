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
import { getAdminApiUrl, TRANSACTION_STATUS } from '@/app/utils/enum';
import { BorderSection } from '../../../reports/styled';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ItemRow from './ItemRow';
import { TransactionType } from './TransactionTypeStep';
import { FoldersIcon, Trash2Icon } from 'lucide-react';
import { primaryColor } from '@/theme/color';
import { gstRate, pstRate } from '@/app/lib/constant';
import DateRange from '../../Modals/DateRangeModal';
import { useEffect, useState } from 'react';
import ErrorComponent from '../../ErrorComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { calculateTaxWithDiscount } from '@/app/utils/item';

interface PropTypes {
  transactionType: TransactionType;
  selectedDate: any;
  setSelectedDate: (date: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  expenseItems: any;
  setExpenseItems: any;
  adminsAndDrivers: any;
  paymentMethods: any;
  selectedVendorId: any;
  setSelectedVendorId?: any;
  sortedVendors: any;
  vendorItems: any;
  isShowDiscountPercent: boolean;
  setIsShowDiscountPercent: (value: boolean) => void;
  smallExpenses: any;
  setSmallExpenses: (data: any) => void;
  isEditMode?: boolean;
  defaultCodDate?: any;
}

export default function DetailsStep({
  transactionType,
  selectedDate,
  setSelectedDate,
  formData,
  setFormData,
  expenseItems,
  setExpenseItems,
  adminsAndDrivers,
  paymentMethods,
  selectedVendorId,
  setSelectedVendorId,
  sortedVendors,
  vendorItems,
  isShowDiscountPercent,
  setIsShowDiscountPercent,
  smallExpenses,
  setSmallExpenses,
  isEditMode = false,
  defaultCodDate,
}: PropTypes) {
  const { companyId }: any = useParams();
  const [codDate, setCodDate] = useState<any>(dayjs(defaultCodDate || ''));
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState(false);

  const { data: codList } = useQuery({
    queryKey: ['codList', codDate.format('MM/DD/YYYY')],
    queryFn: () =>
      axios
        .get(
          getAdminApiUrl(
            companyId,
            `/cod?date=${codDate.format('MM/DD/YYYY')}`,
          ),
        )
        .then((res) => res.data.data),
  });

  useEffect(() => {
    if (defaultCodDate) {
      setCodDate(dayjs(defaultCodDate));
    }

  }, [defaultCodDate]);

  useEffect(() => {
    if (formData?.dateRange && transactionType === 'batch' && !isEditMode) {
      // Get months included in date range
      const uniqueMonths = getUniqueMonthsFromDateRange(
        formData?.dateRange[0],
        formData?.dateRange[1],
      );

      // Divide total by number of months
      const subTotalPerMonth =
        Math.round((formData?.subTotal / uniqueMonths.length) * 100) / 100;
      const totalPerMonth =
        Math.round((formData?.total / uniqueMonths.length) * 100) / 100;
      const gstPerMonth =
        Math.round((formData?.GST / uniqueMonths.length) * 100) / 100;
      const pstPerMonth =
        Math.round((formData?.PST / uniqueMonths.length) * 100) / 100;

      // Set up small expenses for each month in date range
      const newSmallExpenses = uniqueMonths.map((month: any) => ({
        id: crypto.randomUUID(),
        date: new Date(
          `${formData?.dateRange[0]?.getFullYear()}-${month}-${formData?.dateRange[0]?.getDate()}`,
        ),
        subTotal: subTotalPerMonth,
        total: totalPerMonth,
        GST: gstPerMonth,
        PST: pstPerMonth,
        discount: 0,
        discountPercentage: 0,
        description: '',
        spentBy: '',
        paymentMethodId: formData?.paymentMethodId || -1,
      }));

      setSmallExpenses(newSmallExpenses);
    }
  }, [formData?.dateRange, formData?.total]);

  // In edit mode only
  useEffect(() => {
    if (isEditMode && transactionType === 'batch') {
      // Divide total by number of months
      const subTotalPerMonth =
        Math.round((formData?.subTotal / smallExpenses.length) * 100) / 100;
      const totalPerMonth =
        Math.round((formData?.total / smallExpenses.length) * 100) / 100;
      const gstPerMonth =
        Math.round((formData?.GST / smallExpenses.length) * 100) / 100;
      const pstPerMonth =
        Math.round((formData?.PST / smallExpenses.length) * 100) / 100;

      // Set up small expenses for each month in date range
      const newSmallExpenses = smallExpenses.map((expense: any) => ({
        ...expense,
        subTotal: subTotalPerMonth,
        total: totalPerMonth,
        GST: gstPerMonth,
        PST: pstPerMonth,
      }));

      setSmallExpenses(newSmallExpenses);
    }
  }, [formData?.total]);

  const getUniqueMonthsFromDateRange = (
    startDate: Date,
    endDate: Date,
  ): string[] => {
    const months: string[] = [];
    const current = new Date(startDate); // Create a copy to avoid mutation
    const end = new Date(endDate); // Create a copy to avoid mutation

    // Set to the first day of the month to ensure we capture the full month
    current.setDate(1);
    end.setDate(1);

    while (current <= end) {
      // Format as MM (zero-padded month)
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      months.push(month);

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }

    // Return unique months (in case there are duplicates, though there shouldn't be)
    return Array.from(new Set(months));
  };

  const handleSmallExpenseChange = (id: string, field: string, value: any) => {
    setSmallExpenses((prev: any) => {
      if (field === 'date') {
        // Simple date change, no redistribution needed
        return prev.map((expense: any) =>
          expense.id === id ? { ...expense, date: value } : expense,
        );
      }

      if (field === 'subTotal') {
        const newSubTotal = +value;
        const currentExpense = prev.find((expense: any) => expense.id === id);
        const difference = newSubTotal - currentExpense.subTotal;

        // Get all other expenses (excluding the one being changed)
        const otherExpenses = prev.filter((expense: any) => expense.id !== id);
        const redistributionPerExpense =
          otherExpenses.length > 0 ? -difference / otherExpenses.length : 0;

        return prev.map((expense: any) => {
          if (expense.id === id) {
            // Update the current expense
            const newPst = formData?.hasPST ? newSubTotal * pstRate : 0;
            const newGst = formData?.hasGST ? newSubTotal * gstRate : 0;
            const newTotal = newSubTotal + newPst + newGst;

            return {
              ...expense,
              subTotal: newSubTotal,
              GST: Math.round(newGst * 100) / 100,
              PST: Math.round(newPst * 100) / 100,
              total: Math.round(newTotal * 100) / 100,
            };
          } else {
            // Redistribute the difference to other expenses
            const adjustedSubTotal =
              expense.subTotal + redistributionPerExpense;
            const newPst = formData?.hasPST ? adjustedSubTotal * pstRate : 0;
            const newGst = formData?.hasGST ? adjustedSubTotal * gstRate : 0;
            const newTotal = adjustedSubTotal + newPst + newGst;

            return {
              ...expense,
              subTotal: Math.round(adjustedSubTotal * 100) / 100,
              GST: Math.round(newGst * 100) / 100,
              PST: Math.round(newPst * 100) / 100,
              total: Math.round(newTotal * 100) / 100,
            };
          }
        });
      }

      return prev;
    });
  };

  const addExpenseItem = () => {
    const newItem: any = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      unit: [],
    };
    setExpenseItems((prev: any) => [...prev, newItem]);
  };

  const handleDiscountChange = (e: any, type: TransactionType) => {
    const currentSubTotal =
      type === 'stock'
        ? expenseItems.reduce((acc: number, item: any) => {
            return acc + item.total;
          }, 0)
        : (formData?.subTotal || 0) + (formData?.discount || 0);

    if (isShowDiscountPercent) {
      const discount = (currentSubTotal * Number(e.target.value)) / 100;

      const { gstTotal, pstTotal } = calculateTaxWithDiscount(expenseItems, Number(e.target.value));

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
        calculateTaxWithDiscount(expenseItems, discountPercentage);

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

  const handleItemChange = (
    id: number,
    field: string,
    value: string | number | any,
  ) => {
    setExpenseItems((prev: any) =>
      prev.map((item: any) => {
        if (item.id === id) {
          if (field === 'selectedItem') {
            const total = value.inventoryUnit.unitPrice * item.quantity;
            const pst = value.inventoryItem?.hasPST ? total * pstRate : 0;
            const gst = value.inventoryItem?.hasGST ? total * gstRate : 0;

            return {
              ...item,
              id: value.id, // vendorItemId
              units: value.unit,
              unit: value.inventoryUnit,
              vendorId: value.vendorId,
              inventoryItemId: value.inventoryItemId,
              unitPrice: value.inventoryUnit.unitPrice,
              total,
              inventoryItem: value.inventoryItem,
              GST: gst,
              PST: pst,
            };
          }
          const updated: any = {
            ...item,
            [field]: value,
          };

          if (field === 'unit') {
            const total = value.unitPrice * updated.quantity;
            const pst = updated.inventoryItem?.hasPST ? total * pstRate : 0;
            const gst = updated.inventoryItem?.hasGST ? total * gstRate : 0;
            updated.unitPrice = value.unitPrice;
            updated.total = total;
            updated.GST = gst;
            updated.PST = pst;
          }
          if (field === 'quantity' || field === 'unitPrice') {
            const total = updated.unitPrice * updated.quantity;
            const pst = updated.inventoryItem?.hasPST ? total * pstRate : 0;
            const gst = updated.inventoryItem?.hasGST ? total * gstRate : 0;
            updated.total = total;
            updated.GST = gst;
            updated.PST = pst;

            // Update unit price in unit
            updated.unit = {
              ...item.unit,
              unitPrice: updated.unitPrice,
            };

            // Update unit price in units
            const newUnits = item.units.map((unit: any) => {
              if (unit.id === updated.unit?.id) {
                return {
                  ...unit,
                  unitPrice: updated.unitPrice,
                };
              }
              return unit;
            });
            updated.units = newUnits;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const removeSmallExpense = (id: string) => {
    setSmallExpenses((prev: any) => {
      const removedExpense = prev.find((expense: any) => expense.id === id);

      const diff = removedExpense.subTotal;
      const redistributionPerExpense =
        prev.length > 0 ? diff / (prev.length - 1) : 0;

      const newSmallExpenses = prev.map((expense: any) => {
        if (expense.id !== id) {
          const adjustedSubtotal = expense.subTotal + redistributionPerExpense;
          const newSubtotal = Math.round(adjustedSubtotal * 100) / 100;
          const newPst = formData?.hasPST
            ? Math.round(adjustedSubtotal * pstRate * 100) / 100
            : 0;
          const newGst = formData?.hasGST
            ? Math.round(adjustedSubtotal * gstRate * 100) / 100
            : 0;
          const newTotal = newSubtotal + newPst + newGst;

          return {
            ...expense,
            subTotal: newSubtotal,
            GST: newGst,
            PST: newPst,
            total: newTotal,
          };
        }
        return null;
      });

      return newSmallExpenses.filter((expense: any) => expense !== null);
    });
  };

  const removeExpenseItem = (id: number) => {
    if (expenseItems.length > 1) {
      setExpenseItems((prev: any) =>
        prev.filter((item: any) => item.id !== id),
      );
    }
  };

  return (
    <Fade in timeout={500}>
      <Box>
        <DateRange
          open={isSelectRangeOpen}
          onClose={() => setIsSelectRangeOpen(false)}
          dateRange={formData?.dateRange || []}
          setDateRange={(range: any) => {
            setFormData((prev: any) => ({
              ...prev,
              dateRange: range,
            }));
          }}
        />
        <Typography variant="h6" gutterBottom color={blueGrey[800]}>
          {transactionType === 'stock'
            ? 'Stock Purchase Details'
            : transactionType === 'batch'
              ? 'Batch Expense Details'
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
                {transactionType === 'stock' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="invoice-number"
                      label="Invoice Number"
                      value={formData.invoice}
                      onChange={(e) =>
                        setFormData((prev: any) => ({
                          ...prev,
                          invoice: e.target.value,
                        }))
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Receipt />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                )}
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

          {/* Assign COD */}
          {transactionType !== 'batch' && (
            <Grid item xs={12}>
              <BorderSection>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Assign COD
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData?.isCOD}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            isCOD: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Assign COD"
                  />
                </Box>

                {formData.isCOD ? (
                  <Box>
                    {/* COD Date Selection */}
                    {setCodDate && codDate && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Select a date to fetch available COD options
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="COD Date"
                            value={codDate}
                            onChange={(newValue) => {
                              if (newValue && setCodDate) {
                                setCodDate(newValue);
                              }
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: false,
                                sx: { maxWidth: 300 },
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Box>
                    )}

                    <FormControl fullWidth>
                      <InputLabel>COD</InputLabel>
                      <Select
                        disabled={!formData?.isCOD}
                        label="COD"
                        startAdornment={
                          <InputAdornment position="start">
                            <CreditCardIcon />
                          </InputAdornment>
                        }
                        value={formData?.codBoardId}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            codBoardId: +e.target.value,
                          }))
                        }
                      >
                        <MenuItem value={-1}>
                          <em>Select COD</em>
                        </MenuItem>
                        {codList?.map((cod: any) => (
                          <MenuItem key={cod.id} value={cod.id}>
                            {cod.employee?.name || 'No Route Board'} -{' '}
                            {cod.date}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                ) : (
                  <ErrorComponent errorText="No COD assigned" />
                )}
              </BorderSection>
            </Grid>
          )}

          {/* Transaction Items */}
          {transactionType === 'stock' ? (
            <>
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
                      disabled={selectedVendorId === -1}
                    >
                      Add Item
                    </Button>
                  </Box>
                  {/* <Divider sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Select Vendor
                  </Typography>
                </Divider> */}

                  <FormControl fullWidth disabled={!setSelectedVendorId}>
                    <InputLabel sx={{ mb: 1 }} htmlFor="vendor-select">
                      Vendor
                    </InputLabel>
                    <Select
                      id="vendor-select"
                      value={selectedVendorId}
                      onChange={(e) =>
                        setSelectedVendorId?.(Number(e.target.value))
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

                  {selectedVendorId !== -1 &&
                    expenseItems.map((item: any, index: number) => (
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
                        value={formData?.subTotal?.toFixed(2) || 0}
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
                        value={formData?.GST?.toFixed(2) || 0}
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
                        value={formData?.PST?.toFixed(2) || 0}
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
                        value={formData?.total?.toFixed(2) || 0}
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
            </>
          ) : transactionType === 'other' ? (
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
                      onChange={(e) => handleDiscountChange(e, 'other')}
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
                        value={formData?.GST?.toFixed(2) || 0}
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
                        value={formData?.PST?.toFixed(2) || 0}
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
                      value={formData?.total?.toFixed(2) || 0}
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
          ) : (
            <Grid item xs={12}>
              <BorderSection sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <FoldersIcon
                    style={{ width: 24, height: 24, color: primaryColor }}
                  />
                  <Typography variant="subtitle1">Expenses</Typography>
                </Box>

                {/* Date Range */}
                <Typography variant="subtitle1" sx={{ my: 2 }}>
                  Date Range
                </Typography>

                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    value={
                      formData?.dateRange
                        ? formData?.dateRange[0]?.toDateString()
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    onClick={() => setIsSelectRangeOpen(true)}
                  />
                  {/* <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={dayjs(formData.startDate)}
                        onChange={(e: any) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            startDate: e,
                          }));
                        }}
                        sx={{
                          width: '100%',
                          height: '0.1%',
                          borderRadius: 2,
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl> */}

                  <Typography variant="subtitle1"> - </Typography>

                  <TextField
                    fullWidth
                    label="End Date"
                    value={
                      formData?.dateRange
                        ? formData?.dateRange[1]?.toDateString()
                        : ''
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    onClick={() => setIsSelectRangeOpen(true)}
                  />
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  sx={{ my: 2 }}
                >
                  <Typography variant="subtitle1">Total Expenses</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
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

                <Grid container spacing={2}>
                  <Grid item xs={6} md={2}>
                    <TextField
                      fullWidth
                      label="Discount"
                      value={
                        isShowDiscountPercent
                          ? formData.discountPercentage
                          : formData.discount
                      }
                      type="number"
                      onChange={(e) => handleDiscountChange(e, 'batch')}
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
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Subtotal"
                      value={formData?.subTotal || 0}
                      type="number"
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          subTotal: Number(e.target.value),
                          initialSubTotal: Number(e.target.value),
                        }));
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  {formData.hasGST && (
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="GST (5%)"
                        value={formData.GST || 0}
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
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="PST (7%)"
                        value={formData.PST || 0}
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
                      label="Total"
                      value={formData?.total || 0}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1 }}>Expenses</Divider>

                <Typography
                  variant="subtitle1"
                  sx={{ my: 1, fontWeight: 'bold' }}
                >
                  Small Expenses
                </Typography>
                {smallExpenses.length > 0 &&
                  smallExpenses.map((expense: any, index: number) => (
                    <Grid container spacing={2} mt={2} key={index}>
                      <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              label="Date"
                              value={dayjs(expense.date)}
                              onChange={(e: any) => {
                                handleSmallExpenseChange(expense.id, 'date', e);
                              }}
                              sx={{
                                width: '100%',
                                height: '0.1%',
                                borderRadius: 2,
                              }}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <TextField
                          fullWidth
                          label="Subtotal"
                          value={expense.subTotal}
                          type="number"
                          onChange={(e) => {
                            handleSmallExpenseChange(
                              expense.id,
                              'subTotal',
                              +e.target.value,
                            );
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      {formData.hasGST && (
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="GST (5%)"
                            value={expense.GST}
                            type="number"
                            onChange={(e) => {
                              handleSmallExpenseChange(
                                expense.id,
                                'GST',
                                Number(e.target.value),
                              );
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                              readOnly: true,
                            }}
                          />
                        </Grid>
                      )}
                      {formData.hasPST && (
                        <Grid item xs={12} md={2}>
                          <TextField
                            fullWidth
                            label="PST (7%)"
                            value={expense.PST}
                            type="number"
                            onChange={(e) => {
                              handleSmallExpenseChange(
                                expense.id,
                                'PST',
                                Number(e.target.value),
                              );
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
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
                          label="Total"
                          value={expense.total}
                          type="number"
                          onChange={(e) => {
                            handleSmallExpenseChange(
                              expense.id,
                              'total',
                              Number(e.target.value),
                            );
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <IconButton
                          onClick={() => removeSmallExpense(expense.id)}
                        >
                          <Trash2Icon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
              </BorderSection>
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
  );
}
