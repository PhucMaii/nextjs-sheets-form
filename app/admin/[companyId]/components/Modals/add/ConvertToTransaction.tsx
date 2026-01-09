import ModalHead from '@/app/lib/ModalHead';
import {
  Box,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { ShowNotificationType } from '@/hooks/useNotification';
import { IPaymentMethod, IPOItem, IPurchaseOrder } from '@/app/utils/type';
import useSelectDate from '@/hooks/useSelectDate';
import { TRANSACTION_STATUS, getAdminApiUrl } from '@/app/utils/enum';
import { mainPaymentMethodId } from '@/app/lib/constant';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import StatusText from '../../StatusText';
import { calculateTaxWithDiscount } from '@/app/utils/item';
import DisplayFile from '../DisplayFile';
import { PresignedFileUpload } from '@/app/components/PresignedFileUpload';
import { useQuery } from '@tanstack/react-query';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  po: IPurchaseOrder;
}

export default function ConvertToTransaction({
  open,
  onClose,
  showNotification,
  po,
}: IProps) {
  const { companyId }: any = useParams();

  // Fetch expense types
  const { data: expenseTypes } = useQuery({
    queryKey: ['expenseTypes', companyId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/expenses/type'),
      );
      return response.data.data;
    },
  });

  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [updatedPOItems, setUpdatedPOItems] = useState<IPOItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expenseData, setExpenseData] = useState<any>({
    amount: po.totalCost,
    invoice: '',
    description: `Payment for #${po.poNumber}`,
    paymentMethodId: -1,
    spentBy: po.createdBy,
    status: TRANSACTION_STATUS.UNPAID,
    tax: po.tax,
    discount: 0,
    subTotal: po.subtotal,
  });
  const [selectedExpenseTypeId, setSelectedExpenseTypeId] =
    useState<number>(-1);

  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);

  const { date, SelectDate } = useSelectDate(po.estArrival);
  const year = date.split('-')[0];
  const month = date.split('-')[1];

  const router = useRouter();

  useEffect(() => {
    if (po) {
      const cost = calculateTransactionCost(po?.poItems, po?.discount || 0);

      setExpenseData({
        amount: cost.totalCost,
        invoice: '',
        description: `Payment for #${po.poNumber}`,
        paymentMethodId: expenseData?.paymentMethodId || -1,
        spentBy: po.createdBy,
        status: expenseData?.status || TRANSACTION_STATUS.UNPAID,
        tax: cost.tax,
        subTotal: cost.subtotal,
        discount: po?.discount || 0,
      });

      setUpdatedPOItems([...(po?.poItems || [])]);
    }
  }, [po]);

  useEffect(() => {
    fetchAdminsAndDrivers();
    fetchPaymentMethod();
  }, []);

  const formatPOItems = (items: IPOItem[]) => {
    return items.map((item: IPOItem) => ({
      ...item,
      unitPrice: item.costPerItem,
      quantity: item.receivedQty || 0,
    }));
  };

  const onChangeExpense = (field: string, value: number | string) => {
    if (field === 'discount') {
      const discountPercent =
        Math.round(
          (Number(value) / (expenseData?.subTotal + Number(value))) * 100 * 100,
        ) / 100;

      const newSubtotal =
        updatedPOItems.reduce((acc: number, item: IPOItem) => {
          return acc + item.costPerItem * (item.receivedQty || 0);
        }, 0) - Number(value);

      const { pstTotal, gstTotal } = calculateTaxWithDiscount(
        formatPOItems(updatedPOItems),
        discountPercent,
      );

      setExpenseData((prevState: any) => ({
        ...prevState,
        discount: Number(value),
        discountPercent: discountPercent,
        subTotal: newSubtotal,
        tax: gstTotal + pstTotal,
        amount: newSubtotal + gstTotal + pstTotal,
      }));
    } else if (field === 'discountPercent') {
      const newSubtotalWithoutDiscount = updatedPOItems.reduce(
        (acc: number, item: IPOItem) => {
          return acc + item.costPerItem * (item.receivedQty || 0);
        },
        0,
      );

      const discount =
        Math.round((Number(value) / 100) * newSubtotalWithoutDiscount * 100) /
        100;

      const { pstTotal, gstTotal } = calculateTaxWithDiscount(
        formatPOItems(updatedPOItems),
        Number(value),
      );

      setExpenseData((prevState: any) => ({
        ...prevState,
        discount: discount,
        discountPercent: Number(value),
        subTotal: newSubtotalWithoutDiscount - discount,
        tax: gstTotal + pstTotal,
        amount: newSubtotalWithoutDiscount + gstTotal + pstTotal - discount,
      }));
    } else if (field === 'subTotal') {
      const discountPercent =
        Math.round((expenseData?.discount / Number(value)) * 100 * 100) / 100;
      setExpenseData((prevState: any) => ({
        ...prevState,
        discountPercent: discountPercent,
        amount: Number(value) + prevState.tax - expenseData?.discount,
      }));
    } else if (field === 'tax') {
      setExpenseData((prevState: any) => ({
        ...prevState,
        tax: Number(value),
        amount: prevState.subTotal + Number(value) - expenseData?.discount || 0,
      }));
    } else {
      setExpenseData((prevState: any) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const calculateTransactionCost = (items: IPOItem[], discount: number = 0) => {
    const subtotal = items?.reduce((acc: number, item: IPOItem) => {
      return acc + item.costPerItem * (item.receivedQty || 0);
    }, 0);

    const tax = items?.reduce((acc: number, item: IPOItem) => {
      return acc + (item.tax || 0) * (item.receivedQty || 0);
    }, 0);

    const totalCost = subtotal + tax - (discount || 0);

    return { subtotal, tax, totalCost };
  };

  const fetchAdminsAndDrivers = async () => {
    try {
      const res: any = await axios.get(
        getAdminApiUrl(companyId, '/adminsAndDrivers'),
      );

      if (res.data.error) {
        showNotification('error', res.data.message);
        return;
      }

      setAdminsAndDrivers(res.data.data);
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.message);
    }
  };

  const fetchPaymentMethod = async () => {
    try {
      const res = await axios.get(getAdminApiUrl(companyId, '/paymentMethods'));

      if (res.data.error) {
        showNotification('error', res.data.message);
        return;
      }

      setPaymentMethods(res.data.data);
    } catch (error: any) {
      showNotification('error', error.message);
    }
  };

  const onChangeItemCost = (itemId: number, cost: number) => {
    // Change the cost of the item
    const newPOItems = updatedPOItems.map((item: IPOItem) => {
      if (item.id === itemId) {
        return { ...item, costPerItem: cost };
      }
      return item;
    });

    // Calculate the new subtotal
    const newSubtotal =
      newPOItems.reduce((acc: number, item: IPOItem) => {
        return acc + item.costPerItem * (item.receivedQty || 0);
      }, 0) - (expenseData?.discount || 0);

    const discountPercent =
      expenseData?.discountPercent ||
      Math.round(
        (expenseData?.discount / (newSubtotal + expenseData?.discount)) *
          100 *
          100,
      ) / 100;

    const { pstTotal, gstTotal } = calculateTaxWithDiscount(
      formatPOItems(newPOItems),
      discountPercent,
    );

    const newAmount = newSubtotal + gstTotal + pstTotal;

    setUpdatedPOItems(newPOItems);

    setExpenseData({
      ...expenseData,
      subTotal: newSubtotal,
      tax: gstTotal + pstTotal,
      amount: newAmount,
    });
  };

  const validateForm = () => {
    if (expenseData.paymentMethodId === -1) {
      showNotification('error', 'Please add payment method');
      return false;
    }

    if (expenseData.spentBy === '-- Choose who spent --') {
      showNotification('error', 'Please select who spent');
      return false;
    }

    return true;
  };

  const handleReceive = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        getAdminApiUrl(companyId, '/purchase-orders/receive'),
        {
          poId: po.id,
          poItems: updatedPOItems,
          expenseData: {
            ...expenseData,
            date: date,
            typeId: selectedExpenseTypeId,
          },
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.message);
        return;
      }

      showNotification('success', res.data.message);
      onClose();
      router.push(`/admin/${companyId}/purchase-orders`);
    } catch (error: any) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight={'80vh'} overflow={'scroll'}>
        <ModalHead
          heading="Convert to Transaction"
          buttonLabel="Approve"
          onClick={handleReceive}
          onClose={onClose}
          buttonProps={{ loading }}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={1}>
          <Typography>Vendor</Typography>
          <Typography variant="h5">{po?.vendor?.name}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Bill
          </Typography>
          {expenseData?.billFileKey && (
            <DisplayFile
              fileKey={expenseData.billFileKey}
              width="200px"
              height="200px"
            />
          )}
          <PresignedFileUpload
            location={`bills/${year}/${month}`}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={['image/*', 'application/pdf']}
            onUploadComplete={(files) => {
              setExpenseData((prev: any) => ({
                ...prev,
                billFileKey: files[0].fileKey,
                billFileType: files[0].fileType,
              }));
            }}
            isUploaded={!!expenseData.billFileKey}
          />
        </Box>

        <Divider sx={{ my: 2 }}>Items</Divider>

        <Box display="flex" flexDirection="column" gap={2}>
          {updatedPOItems?.map((item: any, index: number) => (
            <Box key={index} display="flex" flexDirection="column" gap={1}>
              <Typography variant="h6">{item.inventoryItem.name}</Typography>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
              >
                <TextField
                  type="number"
                  value={item?.costPerItem || 0}
                  fullWidth
                  label="Unit Price"
                  onChange={(e) => onChangeItemCost(item.id, +e.target.value)}
                />
                <TextField
                  disabled
                  type="number"
                  value={item?.receivedQty || 0}
                  fullWidth
                  label="Quantity"
                />
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }}>Bill</Divider>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Discount */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ width: '100%' }}
            >
              <Typography>Discount ($)</Typography>
              <OutlinedInput
                type="number"
                value={expenseData?.discount}
                fullWidth
                onChange={(e) => onChangeExpense('discount', +e.target.value)}
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
              />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              gap={1}
              sx={{ width: '100%' }}
            >
              <Typography>Discount (%)</Typography>
              <OutlinedInput
                type="number"
                value={expenseData?.discountPercent}
                fullWidth
                onChange={(e) =>
                  onChangeExpense('discountPercent', +e.target.value)
                }
                startAdornment={
                  <InputAdornment position="start">%</InputAdornment>
                }
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Subtotal ($)</Typography>
            <TextField
              type="number"
              value={expenseData.subTotal}
              fullWidth
              onChange={(e) => onChangeExpense('subTotal', +e.target.value)}
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Tax ($)</Typography>
            <TextField
              type="number"
              value={expenseData.tax}
              fullWidth
              onChange={(e) => onChangeExpense('tax', +e.target.value)}
            />
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Total ($)</Typography>
            <TextField
              type="number"
              value={expenseData.amount}
              fullWidth
              disabled
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }}>Expense Info</Divider>

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Date</Typography>
            {SelectDate}
          </Box>

          <FormControl fullWidth>
            <InputLabel htmlFor="assign-type" id="assign-type-label">
              Assign Type
            </InputLabel>
            <Select
              labelId="assign-type-label"
              id="assign-type"
              aria-labelledby="assign-type-label"
              value={selectedExpenseTypeId}
              label="Assign Type"
              fullWidth
              onChange={(e) => {
                setSelectedExpenseTypeId(Number(e.target.value));
              }}
            >
              <MenuItem value={-1}>N/A</MenuItem>
              {expenseTypes?.map((type: any) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Invoice</Typography>
            <TextField
              type="text"
              value={expenseData.invoice}
              fullWidth
              onChange={(e) => onChangeExpense('invoice', e.target.value)}
            />
          </Box>

          {/* Description */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Description</Typography>
            <TextField
              type="text"
              value={expenseData.description}
              fullWidth
              onChange={(e) => onChangeExpense('description', e.target.value)}
            />
          </Box>

          {/* Payment Method */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Payment Method</Typography>
            <Select
              fullWidth
              value={expenseData.paymentMethodId}
              onChange={(e: any) => {
                if (+e.target.value === mainPaymentMethodId) {
                  setExpenseData({
                    ...expenseData,
                    paymentMethodId: +e.target.value,
                    status: TRANSACTION_STATUS.PAID,
                  });
                } else {
                  setExpenseData({
                    ...expenseData,
                    paymentMethodId: +e.target.value,
                  });
                }
              }}
              size="small"
            >
              <MenuItem value={-1} disabled>
                -- Choose a method --
              </MenuItem>
              {paymentMethods.length > 0 &&
                paymentMethods.map((item: any, index: number) => {
                  return (
                    <MenuItem key={index} value={item.id}>
                      {item.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </Box>

          {/* Spent By */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Spent By</Typography>
            <Select
              fullWidth
              value={expenseData.spentBy}
              onChange={(e: any) => {
                setExpenseData({
                  ...expenseData,
                  spentBy: e.target.value,
                });
              }}
            >
              {adminsAndDrivers.map((item: any, index: number) => (
                <MenuItem key={index} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Status */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Status</Typography>
            <Select
              fullWidth
              value={expenseData.status}
              size="small"
              onChange={(e: any) => {
                setExpenseData({ ...expenseData, status: e.target.value });
              }}
            >
              <MenuItem value={TRANSACTION_STATUS.PAID}>
                <StatusText text={TRANSACTION_STATUS.PAID} type="success" />
              </MenuItem>
              <MenuItem value={TRANSACTION_STATUS.UNPAID}>
                <StatusText text={TRANSACTION_STATUS.UNPAID} type="error" />
              </MenuItem>
            </Select>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
