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
  useMediaQuery,
  Paper,
  Fade,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
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
import {
  getAdminApiUrl,
  PAYMENT_METHOD_TYPE,
  TRANSACTION_STATUS,
} from '@/app/utils/enum';
import { BorderSection } from '../../../reports/styled';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ItemRow from './ItemRow';
import { TransactionType } from './TransactionTypeStep';
import { ArrowDownIcon, FoldersIcon, Trash2Icon } from 'lucide-react';
import { primaryColor } from '@/theme/color';
import { gstRate, pstRate } from '@/app/lib/constant';
import DateRange from '../../Modals/DateRangeModal';
import { useEffect, useState, useRef } from 'react';
import ErrorComponent from '../../ErrorComponent';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { calculateTaxWithDiscount } from '@/app/utils/item';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import DisplayFile from '../../Modals/DisplayFile';
import HelpIcon from '@mui/icons-material/Help';
import HideSourceIcon from '@mui/icons-material/HideSource';
import { IExpenseType } from '@/app/utils/type';

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
  isAllowChangeSellingPrice?: boolean;
}

export default function DetailStep({
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
  isAllowChangeSellingPrice = false,
}: PropTypes) {
  const { companyId }: any = useParams();
  const [codDate, setCodDate] = useState<any>(
    defaultCodDate ? dayjs(defaultCodDate) : null,
  );
  const [isSelectRangeOpen, setIsSelectRangeOpen] = useState(false);
  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  // Highlight system state
  const [currentHighlightedSection, setCurrentHighlightedSection] =
    useState<string>('');
  const [isHelpMode, setIsHelpMode] = useState(true);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const month = YYYYMMDDFormat(new Date()).split('/')[0];
  const year = YYYYMMDDFormat(new Date()).split('/')[2];

  useEffect(() => {
    if (codDate) {
      setSelectedDate(codDate);
    }
  }, [codDate]);

  // Define sections based on transaction type
  const getSections = () => {
    const sections = [];

    if (transactionType !== 'batch') {
      sections.push({
        id: 'cod-assignment',
        title: 'COD Assignment',
        icon: <Payment />,
      });
    }

    if (transactionType === 'stock') {
      sections.push(
        { id: 'vendor-selection', title: 'Vendor Selection', icon: <Person /> },
        { id: 'items', title: 'Items', icon: <Receipt /> },
        {
          id: 'basic-info',
          title: 'Basic Information',
          icon: <CreditCardIcon />,
        },
        { id: 'totals', title: 'Tax & Totals', icon: <AttachMoney /> },
      );
    } else if (transactionType === 'batch') {
      sections.push(
        {
          id: 'basic-info',
          title: 'Basic Information',
          icon: <CreditCardIcon />,
        },
        { id: 'date-range', title: 'Date Range', icon: <CalendarToday /> },
        { id: 'expenses', title: 'Expenses', icon: <FoldersIcon /> },
      );
    } else {
      sections.push(
        {
          id: 'basic-info',
          title: 'Basic Information',
          icon: <CreditCardIcon />,
        },
        {
          id: 'amount-details',
          title: 'Amount Details',
          icon: <AttachMoney />,
        },
      );
    }

    return sections;
  };

  const sections = getSections();

  // Highlight system functions
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const moveToNextSection = () => {
    const currentIndex = sections.findIndex(
      (s) => s.id === currentHighlightedSection,
    );
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1];
      setCurrentHighlightedSection(nextSection.id);
      setTimeout(() => scrollToSection(nextSection.id), 100);
    }
  };

  // Auto-highlight first section on mount
  useEffect(() => {
    if (sections.length > 0 && !currentHighlightedSection) {
      setCurrentHighlightedSection(sections[0].id);
    }
  }, [sections, currentHighlightedSection]);

  useEffect(() => {
    if (transactionType === 'stock' && selectedVendorId !== -1) {
      setCurrentHighlightedSection('items');
    }
  }, [selectedVendorId]);

  // Data Fetching
  const { data: codList } = useQuery({
    queryKey: ['codList', codDate ? codDate.format('MM/DD/YYYY') : ''],
    queryFn: () =>
      axios
        .get(
          getAdminApiUrl(
            companyId,
            `/cod?date=${codDate.format('MM/DD/YYYY')}`,
          ),
        )
        .then((res) => res.data.data),

    enabled: !!codDate,
  });

  const { data: expenseTypes } = useQuery({
    queryKey: ['expenseTypes', companyId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/expenses/type'),
      );
      return response.data.data || [];
    },
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
        typeId: formData?.typeId || -1,
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
      isChangeSellingPrice: false,
      sellingPrice: null,
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

      const { gstTotal, pstTotal } = calculateTaxWithDiscount(
        expenseItems,
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
      const { gstTotal, pstTotal } = calculateTaxWithDiscount(
        expenseItems,
        discountPercentage,
      );

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
    id: string | number,
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

  const renderBasicInformation = () => {
    return (
      <Grid item xs={12}>
        <BorderSection
          sx={{ p: 3, mb: 3 }}
          $isHighlighted={
            currentHighlightedSection === 'basic-info' && isHelpMode
          }
          ref={(el) => {
            sectionRefs.current['basic-info'] = el as HTMLElement;
          }}
        >
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
                  onChange={(newValue) => setSelectedDate(newValue || dayjs())}
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
                  <MenuItem value={TRANSACTION_STATUS.UNPAID}>Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {transactionType !== 'stock' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="assign-type" id="assign-type-label">
                    Assign Type
                  </InputLabel>
                  <Select
                    labelId="assign-type-label"
                    id="assign-type"
                    aria-labelledby="assign-type-label"
                    value={formData.typeId}
                    label="Assign Type"
                    fullWidth
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        typeId: Number(e.target.value),
                        type: expenseTypes?.find(
                          (type: IExpenseType) =>
                            type.id === Number(e.target.value),
                        ),
                      }));
                    }}
                  >
                    <MenuItem value={-1}>N/A</MenuItem>
                    {expenseTypes?.map((type: IExpenseType) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

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

            {formData?.paymentMethod?.type === PAYMENT_METHOD_TYPE.CHEQUE && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // gap: 2,
                  mt: 2,
                  p: 2,
                  width: '100%',
                }}
              >
                <Divider sx={{ width: '100%', my: 2 }}>Cheque Proof</Divider>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  width="100%"
                  justifyContent="flex-end"
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isFrontCheque}
                        onChange={(e) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            isFrontCheque: e.target.checked,
                          }));
                        }}
                      />
                    }
                    label="Front"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isBackCheque}
                        onChange={(e) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            isBackCheque: e.target.checked,
                          }));
                        }}
                      />
                    }
                    label="Back"
                  />
                </Box>

                <Box
                  display="flex"
                  flexDirection={mdDown ? 'column' : 'row'}
                  alignItems="flex-start"
                  gap={1}
                  width="100%"
                  mt={2}
                >
                  {!formData?.isFrontCheque && !formData?.isBackCheque && (
                    <ErrorComponent errorText="Please select either front or back of the cheque to upload" />
                  )}
                  {formData?.isFrontCheque && formData?.frontFileKey ? (
                    <Box
                      width="100%"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={2}
                    >
                      <Typography>Front</Typography>
                      <DisplayFile
                        fileKey={formData?.frontFileKey}
                        isCheque={true}
                        width="200px"
                        height="200px"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFormData((prev: any) => ({
                            ...prev,
                            frontFileKey: null,
                            frontFileType: null,
                          }));
                        }}
                      >
                        Upload Other Proof
                      </Button>
                    </Box>
                  ) : formData?.isFrontCheque && !formData?.frontFileKey ? (
                    <Box width="100%">
                      <Typography>Front</Typography>
                      <PresignedFileUpload
                        location={`transactions/${year}/${month}`}
                        isCheque={true}
                        maxFiles={1}
                        maxSize={10 * 1024 * 1024} // 10MB
                        acceptedFileTypes={['image/*', 'application/pdf']}
                        onUploadComplete={(files) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            frontFileKey: files[0].fileKey,
                            frontFileType: files[0].fileType,
                          }));
                        }}
                        isUploaded={!!formData.frontFileKey}
                      />
                    </Box>
                  ) : null}

                  {formData?.isBackCheque && formData?.backFileKey ? (
                    <Box
                      width="100%"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      gap={2}
                    >
                      <Typography>Back</Typography>
                      <DisplayFile
                        fileKey={formData?.backFileKey}
                        isCheque={true}
                        width="200px"
                        height="200px"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFormData((prev: any) => ({
                            ...prev,
                            backFileKey: null,
                            backFileType: null,
                          }));
                        }}
                      >
                        Upload Other Proof
                      </Button>
                    </Box>
                  ) : formData?.isBackCheque && !formData?.backFileKey ? (
                    <Box width="100%">
                      <Typography>Back</Typography>
                      <PresignedFileUpload
                        location={`transactions/${year}/${month}`}
                        isCheque={true}
                        maxFiles={1}
                        maxSize={10 * 1024 * 1024} // 10MB
                        acceptedFileTypes={['image/*', 'application/pdf']}
                        onUploadComplete={(files) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            backFileKey: files[0].fileKey,
                            backFileType: files[0].fileType,
                          }));
                        }}
                        isUploaded={!!formData.backFileKey}
                      />
                    </Box>
                  ) : null}
                </Box>
              </Box>
            )}
          </Grid>
          {currentHighlightedSection === 'basic-info' && nextButton()}
        </BorderSection>
      </Grid>
    );
  };

  const nextButton = () => {
    if (!isHelpMode) {
      return null;
    }
    return (
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowDownIcon />}
          onClick={moveToNextSection}
        >
          Next
        </Button>
      </Box>
    );
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

        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          mb={2}
        >
          <Button
            startIcon={isHelpMode ? <HideSourceIcon /> : <HelpIcon />}
            onClick={() => setIsHelpMode(!isHelpMode)}
          >
            {isHelpMode ? 'Hide Help' : 'Help me navigate'}
          </Button>
        </Box>
        {/* Progress Indicator */}
        {isHelpMode && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              backgroundColor: 'grey.50',
              boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              color={blueGrey[800]}
              sx={{ mb: 1.5 }}
            >
              {transactionType === 'stock'
                ? 'Stock Purchase Details'
                : transactionType === 'batch'
                  ? 'Batch Expense Details'
                  : 'Expense Details'}
            </Typography>

            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
              {sections.map((section, index) => {
                const isCurrent = currentHighlightedSection === section.id;
                const isUpcoming =
                  !isCurrent &&
                  sections.findIndex((s) => s.id === section.id) >
                    sections.findIndex(
                      (s) => s.id === currentHighlightedSection,
                    );

                return (
                  <Box key={section.id} display="flex" alignItems="center">
                    <Box
                      onClick={() => {
                        setCurrentHighlightedSection(section.id);
                        scrollToSection(section.id);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: isCurrent
                          ? `${primaryColor}08`
                          : 'transparent',
                        border: isCurrent
                          ? `1px solid ${primaryColor}40`
                          : '1px solid transparent',
                        '&:hover': {
                          backgroundColor: isCurrent
                            ? `${primaryColor}12`
                            : 'grey.100',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: isCurrent
                            ? `${primaryColor}20`
                            : 'grey.300',
                          color: isCurrent ? primaryColor : 'grey.600',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {section.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isCurrent ? 600 : 'normal',
                          color: isCurrent ? primaryColor : 'text.primary',
                          opacity: isUpcoming ? 0.7 : 1,
                          fontSize: '0.875rem',
                        }}
                      >
                        {section.title}
                      </Typography>
                    </Box>

                    {index < sections.length - 1 && (
                      <Box
                        sx={{
                          width: 16,
                          height: 1,
                          backgroundColor: 'grey.300',
                          mx: 0.5,
                          transition: 'background-color 0.2s ease',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1.5, display: 'block' }}
            >
              {currentHighlightedSection && (
                <>
                  Step{' '}
                  {sections.findIndex(
                    (s) => s.id === currentHighlightedSection,
                  ) + 1}{' '}
                  of {sections.length}:{' '}
                  {
                    sections.find((s) => s.id === currentHighlightedSection)
                      ?.title
                  }
                </>
              )}
            </Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Assign COD */}
          {transactionType !== 'batch' && (
            <Grid item xs={12}>
              <BorderSection
                ref={(el) => {
                  sectionRefs.current['cod-assignment'] = el as HTMLElement;
                }}
                $isHighlighted={
                  currentHighlightedSection === 'cod-assignment' && isHelpMode
                }
              >
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
                        onChange={(e) => {
                          setFormData((prev: any) => ({
                            ...prev,
                            isCOD: e.target.checked,
                          }));
                        }}
                      />
                    }
                    label="Assign COD"
                  />
                </Box>

                {formData.isCOD ? (
                  <Box>
                    {/* COD Date Selection */}
                    {/* {setCodDate && codDate && ( */}
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
                    {/* )} */}

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
                {currentHighlightedSection === 'cod-assignment' && nextButton()}
              </BorderSection>
              {/* </HighlightedSection> */}
            </Grid>
          )}

          {/* Transaction Items */}
          {transactionType === 'stock' ? (
            <>
              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="vendor-selection"
                  title="Vendor Selection"
                  icon={<Person />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'vendor-selection' &&
                    isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['vendor-selection'] = el as HTMLElement;
                  }}
                >
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
                  {currentHighlightedSection === 'vendor-selection' &&
                    nextButton()}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="items"
                  title="Items"
                  icon={<Receipt />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'items' && isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['items'] = el as HTMLElement;
                  }}
                >
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
                        isAllowChangeSellingPrice={isAllowChangeSellingPrice}
                      />
                    ))}

                  {currentHighlightedSection === 'items' && nextButton()}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="basic-info"
                  title="Basic Information"
                  icon={<CreditCardIcon />}
                > */}
                {renderBasicInformation()}
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="totals"
                  title="Tax Calculation & Totals"
                  icon={<AttachMoney />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'totals' && isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['totals'] = el as HTMLElement;
                  }}
                >
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
                  {/* {currentHighlightedSection === 'totals' && nextButton()} */}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>
            </>
          ) : transactionType === 'batch' ? (
            <>
              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="basic-info"
                  title="Basic Information"
                  icon={<CreditCardIcon />}
                > */}
                {renderBasicInformation()}
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="date-range"
                  title="Date Range"
                  icon={<CalendarToday />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'date-range' && isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['date-range'] = el as HTMLElement;
                  }}
                >
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
                  {currentHighlightedSection === 'date-range' && nextButton()}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="expenses"
                  title="Expenses"
                  icon={<FoldersIcon />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'expenses' && isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['expenses'] = el as HTMLElement;
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <FoldersIcon
                      style={{ width: 24, height: 24, color: primaryColor }}
                    />
                    <Typography variant="subtitle1">Expenses</Typography>
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
                          value={formData.PST || 0}
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
                                  handleSmallExpenseChange(
                                    expense.id,
                                    'date',
                                    e,
                                  );
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

                  {currentHighlightedSection === 'expenses' && nextButton()}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="basic-info"
                  title="Basic Information"
                  icon={<CreditCardIcon />}
                > */}
                {renderBasicInformation()}
                {/* </HighlightedSection> */}
              </Grid>

              <Grid item xs={12}>
                {/* <HighlightedSection
                  sectionId="amount-details"
                  title="Amount Details"
                  icon={<AttachMoney />}
                > */}
                <BorderSection
                  sx={{ p: 3 }}
                  $isHighlighted={
                    currentHighlightedSection === 'amount-details' && isHelpMode
                  }
                  ref={(el) => {
                    sectionRefs.current['amount-details'] = el as HTMLElement;
                  }}
                >
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
                      <Grid item xs={6} md={2}>
                        <TextField
                          fullWidth
                          label="PST (7%)"
                          value={formData?.PST?.toFixed(2) || 0}
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
                  {currentHighlightedSection === 'amount-details' &&
                    nextButton()}
                </BorderSection>
                {/* </HighlightedSection> */}
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Fade>
  );
}
