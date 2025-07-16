'use client';
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
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
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import useNotification from '@/hooks/useNotification';
import Sidebar from '../../components/Sidebar/Sidebar';
import dayjs, { Dayjs } from 'dayjs';
import DetailsStep from '../../components/Stepper/CreateTransaction/DetailStep';
import TransactionTypeStep from '../../components/Stepper/CreateTransaction/TransactionTypeStep';
import ReviewStep from '../../components/Stepper/CreateTransaction/ReviewStep';
import { MousePointerIcon, ReceiptTextIcon } from 'lucide-react';
import {
  primary,
  primaryColor,
  successBackground,
  successColor,
} from '@/theme/color';
import { ShadowSection } from '../../reports/styled';

interface ExpenseItem {
  id: string | number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit: any[];
}

export default function CreateTransaction() {
  const { companyId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [transactionType, setTransactionType] = useState('stock');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
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
  });

  // Expense items for stock purchases
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      unit: [],
    },
  ]);
  const steps = [
    { label: 'Transaction Type', icon: <MousePointerIcon /> },
    { label: 'Details', icon: <ReceiptTextIcon /> },
    { label: 'Review & Submit', icon: <Preview /> },
  ];

  // Handle expense item changes
  const handleItemChange = (
    id: string,
    field: string,
    value: string | number | any,
  ) => {
    setExpenseItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (field === 'selectedItem') {
            return {
              ...item,
              id: value.id,
              unit: value.unit,
              inventoryUnit: value.inventoryUnit,
              unitPrice: value.inventoryUnit.unitPrice,
              total: value.inventoryUnit.unitPrice * item.quantity,
              inventoryItem: value.inventoryItem,
            };
          }
          const updated = {
            ...item,
            [field]: value,
          };

          if (field === 'inventoryUnit') {
            updated.unitPrice = value.unitPrice;
            updated.total = value.unitPrice * item.quantity;
          }
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  // Add new expense item
  const addExpenseItem = () => {
    const newItem: any = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      unit: [],
    };
    setExpenseItems((prev) => [...prev, newItem]);
  };

  const clearExpenseItems = () => {
    setExpenseItems([
      {
        id: '1',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        unit: [],
      },
    ]);
  };

  // Remove expense item
  const removeExpenseItem = (id: string) => {
    if (expenseItems.length > 1) {
      setExpenseItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const createdAt = generateCurrentTime();
      const date = YYYYMMDDFormat(selectedDate.toDate());

      const response = await axios.post(
        getAdminApiUrl(companyId, '/expenses'),
        {
          date,
          createdAt,
          spentBy: formData.spentBy,
          total: formData.total,
          subTotal: formData.subTotal,
          GST: formData.GST,
          PST: formData.PST,
          description: formData.description,
          discount: formData.discount,
          paymentMethodId: formData.paymentMethodId,
          status: formData.status,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsSubmitting(false);
        return;
      }

      showNotification('success', 'Transaction created successfully!');
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
            <IconButton
              onClick={() => router.back()}
              sx={{
                backgroundColor: grey[100],
                '&:hover': { backgroundColor: grey[200] },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Box>
        </Box>

        {/* Stepper */}
        <ShadowSection sx={{ p: 2, mb: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
              <Step key={step.label}>
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
              addExpenseItem={addExpenseItem}
              handleItemChange={handleItemChange}
              removeExpenseItem={removeExpenseItem}
              clearExpenseItems={clearExpenseItems}
            />
          )}
          {activeStep === 2 && (
            <ReviewStep
              transactionType={transactionType}
              selectedDate={selectedDate}
              formData={formData}
              expenseItems={expenseItems}
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
