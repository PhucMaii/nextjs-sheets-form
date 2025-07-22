'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { blueGrey } from '@mui/material/colors';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getAdminApiUrl } from '@/app/utils/enum';
import dayjs, { Dayjs } from 'dayjs';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Fade } from '@mui/material';
import DetailsStep from '../../components/Stepper/CreateTransaction/DetailStep';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IExpense } from '@/app/utils/type';
import { gstRate, pstRate } from '@/app/lib/constant';
import useNotification from '@/hooks/useNotification';

export default function EditTransaction() {
  const { companyId, id }: any = useParams();
  const params: any = useSearchParams();
  const type = params.get('type');
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactionData, setTransactionData] = useState<IExpense | any>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(
    dayjs(transactionData?.date),
  );
  const [isShowDiscountPercent, setIsShowDiscountPercent] = useState(false);
  const [expenseItems, setExpenseItems] = useState<any[]>([]);
  const [vendorItems, setVendorItems] = useState<any[]>([]);
  const [smallExpenses, setSmallExpenses] = useState<any[]>([]);

  const { data: adminsAndDrivers } = useQuery({
    queryKey: ['adminsAndDrivers', companyId, id],
    queryFn: async () => {
      const res = await axios.get(
        getAdminApiUrl(companyId, '/adminsAndDrivers'),
      );

      return res.data.data;
    },
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ['paymentMethods', companyId, id],
    queryFn: async () => {
      const res = await axios.get(getAdminApiUrl(companyId, '/paymentMethods'));

      return res.data.data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () =>
      axios
        .get(getAdminApiUrl(companyId, '/vendors'))
        .then((res) => res.data.data),
  });

  const sortedVendors = useMemo(() => {
    if (!vendors) {
      return [];
    }

    const vendorsSorted = [...vendors].sort((a: any, b: any) => {
      return a?.name?.localeCompare(b?.name);
    });

    return vendorsSorted;
  }, [vendors]);

  // Get transaction type
  const transactionType = useMemo(() => {
    if (
      transactionData?.transactions?.length &&
      transactionData?.transactions?.length > 0
    ) {
      return 'batch';
    }

    if (
      transactionData?.orderedItems?.length &&
      transactionData?.orderedItems?.length > 0
    ) {
      return 'stock';
    }

    return 'other';
  }, [transactionData]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        // Mock transaction data based on the id
        const res = await axios.get(
          getAdminApiUrl(companyId, `/expenses?id=${id}&type=${type}`),
        );
        const transaction = res.data.data;

        setTransactionData({
          ...transaction,
          hasPST: transaction?.PST || transaction.PST > 0,
          hasGST: transaction?.GST || transaction.GST > 0,
          total: transaction?.total || transaction?.amount || 0,
        });
        setSelectedDate(dayjs(transaction.date));

        if (type === 'batch' && transaction?.transactions) {
          const smallExpenses = transaction?.transactions.map(
            (smallExpense: any) => ({
              ...smallExpense,
              total: smallExpense?.amount || 0,
            }),
          );
          setSmallExpenses(smallExpenses);
        }

        setExpenseItems(transaction?.orderedItems || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transaction:', error);
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [id]);

  // Set vendor items when selected vendor changes
  useEffect(() => {
    if (transactionData?.vendors && vendors) {
      const vendorId = transactionData?.vendors[0]?.vendorId;

      if (vendors && vendorId) {
        const targetVendor = vendors?.find((vendor: any) => {
          return vendor.id === vendorId;
        });

        if (targetVendor) {
          setVendorItems(targetVendor?.vendorItem || []);

          // Set expense items
          const reConfigExpenseItems = expenseItems.map((item: any) => {
            const targetVendorItem = targetVendor?.vendorItem?.find(
              (vItem: any) => vItem.inventoryItemId === item.inventoryItemId,
            );

            const subTotal = item?.price * item?.quantity;
            const PST = item?.inventoryItem?.hasPST ? subTotal * pstRate : 0;
            const GST = item?.inventoryItem?.hasGST ? subTotal * gstRate : 0;
            return {
              ...item,
              unit: item?.inventoryUnit || {},
              units: targetVendorItem?.unit || [],
              unitPrice: item?.price || 0,
              total: subTotal,
              id: targetVendorItem?.id || -1,
              PST: PST,
              GST: GST,
            };
          });

          setExpenseItems(reConfigExpenseItems);
        }
      }
    }
  }, [transactionData?.vendors]);

  // Calculate subtotal, gst, pst, discount, total - only work for stock
  useEffect(() => {
    if (transactionType !== 'stock') return;
    if (expenseItems.length === 0) {
      setTransactionData((prev: any) => ({
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
      }, 0) - (transactionData?.discount || 0);

    const discountPercentage =
      ((transactionData?.discount || 0) /
        (subTotal + transactionData?.discount)) *
      100;

    const { gstTotal, pstTotal } = calculateTaxWithDiscount(discountPercentage);

    setTransactionData((prev: any) => ({
      ...prev,
      subTotal: subTotal,
      GST: gstTotal,
      PST: pstTotal,
      total: subTotal + gstTotal + pstTotal,
      discountPercentage: discountPercentage,
    }));
  }, [expenseItems]);

  // This useEffect could not work with Stock type
  useEffect(() => {
    if (transactionType === 'stock') return;

    if (transactionData?.hasGST || transactionData?.hasPST) {
      const gstTotal = transactionData?.hasGST
        ? Math.round(transactionData?.subTotal * gstRate * 100) / 100
        : 0;
      const pstTotal = transactionData?.hasPST
        ? Math.round(transactionData?.subTotal * pstRate * 100) / 100
        : 0;

      setTransactionData((prev: any) => ({
        ...prev,
        GST: gstTotal,
        PST: pstTotal,
        total: transactionData?.subTotal + gstTotal + pstTotal,
      }));
    } else {
      setTransactionData((prev: any) => ({
        ...prev,
        GST: 0,
        PST: 0,
        total: transactionData?.subTotal,
      }));
    }
  }, [
    transactionData?.hasGST,
    transactionData?.hasPST,
    transactionData?.subTotal,
  ]);

  const handleSaveStockPurchase = async () => {
    try {
      const updatedItems = expenseItems.map((item: any) => {
        const oldItem = transactionData?.orderedItems?.find(
          (oldItem: any) => oldItem.inventoryItemId === item.inventoryItemId,
        );

        return {
          id: oldItem?.id,
          name: item.inventoryItem.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vendorId: transactionData?.vendors[0]?.vendorId,
          unit: item.unit,
          units: item.units,
          inventoryItem: item.inventoryItem,
          vendorItemId: item.id,
        };
      });

      const response = await axios.put(
        getAdminApiUrl(companyId, '/inventory/expenses'),
        {
          id: transactionData.id,
          date: dayjs(transactionData.date).format('MM/DD/YYYY'),
          amount: transactionData.total,
          PST: transactionData?.PST || 0,
          GST: transactionData?.GST || 0,
          subTotal: transactionData?.subTotal || 0,
          description: transactionData.description,
          paymentMethodId: transactionData.paymentMethodId,
          spentBy: transactionData.spentBy,
          invoice: transactionData.invoice,
          discount: transactionData?.discount || 0,
          oldItems: transactionData?.orderedItems || [],
          updatedItems: updatedItems,
          isAffectQuantity: true,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification('error', 'Something went wrong');
    }
  };

  const handleSaveOtherExpense = async () => {
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/expenses'), {
        id: transactionData.id,
        date: dayjs(transactionData.date).format('MM/DD/YYYY'),
        amount: transactionData.total,
        subTotal: transactionData.subTotal,
        discount: transactionData?.discount || 0,
        GST: transactionData.GST,
        PST: transactionData.PST,
        description: transactionData.description,
        paymentMethodId: transactionData.paymentMethodId,
        spentBy: transactionData.spentBy,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification('error', 'Something went wrong');
    }
  };

  const handleSave = async () => {
    if (transactionType === 'stock' && expenseItems.length === 0) {
      showNotification('error', 'Please add items to the stock purchase');
      return;
    }

    if (transactionType === 'batch' && smallExpenses.length === 0) {
      showNotification(
        'error',
        'Please add small expenses to the batch transaction',
      );
      return;
    }

    try {
      setSaving(true);
      if (transactionType === 'stock') {
        await handleSaveStockPurchase();
      }

      if (transactionType === 'other') {
        await handleSaveOtherExpense();
      }

      setSaving(false);
      router.push(`/admin/${companyId}/transactions`);
    } catch (error) {
      console.error('Error saving transaction:', error);
      setSaving(false);
    }
  };

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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'batch':
        return {
          backgroundColor: '#f8f9ff',
          borderColor: '#1976d2',
          chipColor: 'primary' as const,
        };
      case 'stock':
        return {
          backgroundColor: '#f3f8f3',
          borderColor: '#388e3c',
          chipColor: 'success' as const,
        };
      case 'other':
        return {
          backgroundColor: '#fafafa',
          borderColor: '#757575',
          chipColor: 'default' as const,
        };
      default:
        return {
          backgroundColor: '#fafafa',
          borderColor: '#757575',
          chipColor: 'default' as const,
        };
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
      >
        <Typography>Loading transaction...</Typography>
      </Box>
    );
  }

  if (!transactionData) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="400px"
      >
        <Alert severity="error">Transaction not found</Alert>
      </Box>
    );
  }

  const typeStyles = getTypeStyles(transactionData.type);

  return (
    <Sidebar>
      {NotificationComp}
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Box
          component="main"
          sx={{ flexGrow: 1, width: { xs: '100%', md: 'calc(100% - 240px)' } }}
        >
          {/* <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> */}
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
              <Link
                underline="hover"
                color="inherit"
                href={`/admin/${companyId}`}
                sx={{ cursor: 'pointer' }}
              >
                Dashboard
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href={`/admin/${companyId}/transactions`}
                sx={{ cursor: 'pointer' }}
              >
                Transactions
              </Link>
              <Typography color="text.primary">Edit Transaction</Typography>
            </Breadcrumbs>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h4" gutterBottom color={blueGrey[800]}>
                  Edit Transaction
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Chip
                    label={transactionType}
                    color={typeStyles.chipColor}
                    variant="filled"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID: {transactionData.id}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ minWidth: 120 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Fade in timeout={500}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                //   border: `2px solid ${typeStyles.borderColor}`,
                //   backgroundColor: typeStyles.backgroundColor,
                boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
              }}
            >
              <DetailsStep
                transactionType={transactionType}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                formData={transactionData}
                setFormData={setTransactionData}
                expenseItems={expenseItems}
                setExpenseItems={setExpenseItems}
                adminsAndDrivers={adminsAndDrivers}
                paymentMethods={paymentMethods}
                selectedVendorId={
                  transactionData?.vendors &&
                  transactionData?.vendors[0]?.vendorId
                    ? transactionData?.vendors[0]?.vendorId
                    : -1
                }
                sortedVendors={sortedVendors}
                vendorItems={vendorItems}
                isShowDiscountPercent={isShowDiscountPercent}
                setIsShowDiscountPercent={setIsShowDiscountPercent}
                smallExpenses={smallExpenses}
                setSmallExpenses={setSmallExpenses}
                isEditMode
              />
            </Paper>
          </Fade>
          {/* </Container> */}
        </Box>
      </Box>
    </Sidebar>
  );
}
