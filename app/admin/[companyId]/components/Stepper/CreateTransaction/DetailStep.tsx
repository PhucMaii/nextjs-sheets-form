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
import { BorderSection } from '../../../reports/styled';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ItemRow from './ItemRow';

interface PropTypes {
  transactionType: string;
  selectedDate: any;
  setSelectedDate: (date: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  expenseItems: any;
  addExpenseItem: () => void;
  handleItemChange: any;
  removeExpenseItem: any;
  adminsAndDrivers: any;
  paymentMethods: any;
  selectedVendorId: any;
  setSelectedVendorId: any;
  sortedVendors: any;
  vendorItems: any;
  isShowDiscountPercent: boolean;
  setIsShowDiscountPercent: (value: boolean) => void;
  handleDiscountChange: (e: any, type: 'stock' | 'expense') => void;
}

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
  adminsAndDrivers,
  paymentMethods,
  selectedVendorId,
  setSelectedVendorId,
  sortedVendors,
  vendorItems,
  isShowDiscountPercent,
  setIsShowDiscountPercent,
  handleDiscountChange,
}: PropTypes) {
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
