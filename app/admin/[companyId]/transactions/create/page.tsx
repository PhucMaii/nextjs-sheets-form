'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ArrowBack, Save, Preview } from '@mui/icons-material';
import { blueGrey, grey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import { getAdminApiUrl, TRANSACTION_STATUS } from '@/app/utils/enum';
import { generateMonthRange, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import Sidebar from '../../components/Sidebar/Sidebar';
import dayjs, { Dayjs } from 'dayjs';
import DetailsStep from '../../components/Stepper/CreateTransaction/DetailStep';
import TransactionTypeStep, {
  TransactionType,
} from '../../components/Stepper/CreateTransaction/TransactionTypeStep';
import ReviewStep from '../../components/Stepper/CreateTransaction/ReviewStep';
import { MousePointerIcon, ReceiptTextIcon } from 'lucide-react';
import {
  primary,
  primaryColor,
  successBackground,
  successColor,
} from '@/theme/color';
import { ShadowSection } from '../../reports/styled';
import { useQuery } from '@tanstack/react-query';
import { gstRate, pstRate } from '@/app/lib/constant';
import { IExpenseItem } from '@/pages/api/admin/[companyId]/inventory/expenses/POST';

export default function CreateTransaction() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

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

  // Small expenses for batch expenses
  const [smallExpenses, setSmallExpenses] = useState<any[]>([]);

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [transactionType, setTransactionType] =
    useState<TransactionType>('stock');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<any>({
    invoice: '',
    description: '',
    spentBy: '',
    paymentMethodId: -1,
    status: TRANSACTION_STATUS.UNPAID,
    subTotal: 0,
    GST: 0,
    PST: 0,
    discount: 0,
    total: 0,
    discountPercentage: 0,
    hasGST: false,
    hasPST: false,
    initialSubTotal: 0,
    vendorId: -1,
    vendor: null,
    inventoryItems: [],
    inventoryUnits: [],
    inventoryItem: null,
    inventoryUnit: null,
    dateRange: generateMonthRange(),
  });

  // Expense items for stock purchases
  const [expenseItems, setExpenseItems] = useState<IExpenseItem[]>([
    {
      id: 1,
      vendorId: 1,
      quantity: 1,
      units: [],
      unit: null,
      inventoryItemId: 1,
    },
  ]);

  const sortedVendors = useMemo(() => {
    if (!vendors) {
      return [];
    }

    const vendorsSorted = [...vendors].sort((a: any, b: any) => {
      return a?.name?.localeCompare(b?.name);
    });

    return vendorsSorted;
  }, [vendors]);

  // Clear form data and expense items when transaction type changes
  useEffect(() => {
    clearFormData();
    clearExpenseItems();
  }, [transactionType]);

  // Clear expense items when selected vendor changes
  useEffect(() => {
    clearExpenseItems();
  }, [selectedVendorId]);

  // Set vendor items when selected vendor changes
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

  // This useEffect could not work with Stock type
  useEffect(() => {
    if (transactionType === 'stock') return;

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
    } else {
      setFormData((prev: any) => ({
        ...prev,
        GST: 0,
        PST: 0,
        total: formData.subTotal,
      }));
    }
  }, [formData.hasGST, formData.hasPST, formData.subTotal]);

  const steps = [
    { label: 'Transaction Type', icon: <MousePointerIcon /> },
    { label: 'Details', icon: <ReceiptTextIcon /> },
    { label: 'Review & Submit', icon: <Preview /> },
  ];

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

  const clearExpenseItems = () => {
    setExpenseItems([
      {
        id: -1,
        vendorId: 1,
        quantity: 1,
        units: [],
        unit: null,
        inventoryItemId: 1,
      },
    ]);
  };

  const clearFormData = () => {
    setFormData((prev: any) => ({
      ...prev,
      description: '',
      spentBy: '',
      paymentMethodId: -1,
      status: TRANSACTION_STATUS.UNPAID,
      subTotal: 0,
      GST: 0,
      PST: 0,
      discount: 0,
      total: 0,
      discountPercentage: 0,
      hasGST: false,
      hasPST: false,
      initialSubTotal: 0,
      vendorId: -1,
      vendor: null,
      inventoryItems: [],
      inventoryUnits: [],
      inventoryItem: null,
      inventoryUnit: null,
    }));
  };

  // Remove expense item
  // const removeExpenseItem = (id: number) => {
  //   if (expenseItems.length > 1) {
  //     setExpenseItems((prev) => prev.filter((item) => item.id !== id));
  //   }
  // };

  const handleSubmitStock = async () => {
    try {
      if (expenseItems.length === 0) {
        showNotification('error', 'Please add items to the stock purchase');
        return;
      }

      const response = await axios.post(
        getAdminApiUrl(companyId, '/inventory/expenses'),
        {
          date: YYYYMMDDFormat(selectedDate.toDate()),
          amount: Math.round(formData.total * 100) / 100,
          description: formData.description,
          paymentMethodId: formData.paymentMethodId,
          spentBy: formData.spentBy,
          invoice: formData.invoice,
          subTotal: Math.round(formData.subTotal * 100) / 100,
          GST: Math.round(formData.GST * 100) / 100,
          PST: Math.round(formData.PST * 100) / 100,
          discount: Math.round(formData.discount * 100) / 100,
          status: formData.status,
          codBoardId: formData?.codBoardId || null,
          items: expenseItems,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    }
  };

  const handleSubmitExpense = async () => {
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/expenses'),
        {
          amount: formData.total,
          PST: formData.PST,
          GST: formData.GST,
          subTotal: formData.subTotal,
          description: formData.description,
          spentBy: formData.spentBy,
          date: YYYYMMDDFormat(selectedDate.toDate()),
          paymentMethodId: formData.paymentMethodId,
          status: formData.status,
          discount: formData.discount,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    }
  };

  const handleSubmitBatchTransaction = async () => {
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/batch-transactions'),
        {
          batchTransaction: {
            ...formData,
            date: dayjs(selectedDate.toDate()).format('MM/DD/YYYY'),
            startDate: dayjs(formData.startDate.toDate()).format('MM/DD/YYYY'),
            endDate: dayjs(formData.endDate.toDate()).format('MM/DD/YYYY'),
          },
          smallExpenses: smallExpenses.map((expense: any) => ({
            ...expense,
            date: dayjs(expense.date).format('MM/DD/YYYY'),
          })),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification('error', 'Something went wrong: ' + error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (transactionType === 'stock') {
        await handleSubmitStock();
      }

      if (transactionType === 'other') {
        await handleSubmitExpense();
      }

      if (transactionType === 'batch') {
        await handleSubmitBatchTransaction();
      }

      setIsSubmitting(false);
      router.push(`/admin/${companyId}/transactions`);
    } catch (error: any) {
      console.log('Something went wrong: ', error);
      showNotification('error', 'Something went wrong: ' + error);
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return transactionType !== '';
      case 1:
        return formData.spentBy !== '' && formData.paymentMethodId !== -1;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Sidebar>
      {NotificationComp}
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={4}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
              color="inherit"
              href={`/admin/${companyId}/transactions`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              Transactions
            </Link>
            <Typography color="text.primary">Create New</Typography>
          </Breadcrumbs>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={blueGrey[800]}
                gutterBottom
              >
                Create New Transaction
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Add a new expense or stock purchase to your records
              </Typography>
            </Box>
            {/* <IconButton
              onClick={() => router.back()}
              sx={{
                backgroundColor: grey[100],
                '&:hover': { backgroundColor: grey[200] },
              }}
            >
              <ArrowBack />
            </IconButton> */}
          </Box>
        </Box>

        {/* Stepper */}
        <ShadowSection sx={{ p: 2, mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step
                key={step.label}
                onClick={() => {
                  // Only allow to go to previous steps
                  if (index < activeStep) {
                    setActiveStep(index);
                  }
                }}
              >
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completed
                          ? successBackground
                          : active
                            ? primary['lightest']
                            : grey[300],
                        color: completed
                          ? successColor
                          : active
                            ? primaryColor
                            : 'white',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </ShadowSection>

        {/* Step Content */}
        <ShadowSection sx={{ p: 4, mb: 4, minHeight: 400, borderRadius: 2 }}>
          {activeStep === 0 && (
            <TransactionTypeStep
              transactionType={transactionType}
              setTransactionType={setTransactionType}
            />
          )}
          {activeStep === 1 && (
            <DetailsStep
              transactionType={transactionType}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              formData={formData}
              setFormData={setFormData}
              expenseItems={expenseItems}
              setExpenseItems={setExpenseItems}
              adminsAndDrivers={adminsAndDrivers}
              paymentMethods={paymentMethods}
              selectedVendorId={selectedVendorId}
              setSelectedVendorId={setSelectedVendorId}
              vendorItems={vendorItems}
              sortedVendors={sortedVendors}
              isShowDiscountPercent={isShowDiscountPercent}
              setIsShowDiscountPercent={setIsShowDiscountPercent}
              smallExpenses={smallExpenses}
              setSmallExpenses={setSmallExpenses}
            />
          )}
          {activeStep === 2 && (
            <ReviewStep
              transactionType={transactionType}
              selectedDate={selectedDate}
              formData={formData}
              expenseItems={expenseItems}
              smallExpenses={smallExpenses}
            />
          )}
        </ShadowSection>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep((prev) => prev - 1)}
            disabled={activeStep === 0}
            startIcon={<ArrowBack />}
          >
            Previous
          </Button>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/admin/${companyId}/transactions`)}
            >
              Cancel
            </Button>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                startIcon={<Save />}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Transaction'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setActiveStep((prev) => prev + 1)}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Sidebar>
  );
}
