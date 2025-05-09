import ModalHead from '@/app/lib/ModalHead';
import {
  Box,
  Divider,
  MenuItem,
  Modal,
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

  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);

  const { date, SelectDate } = useSelectDate(po.estArrival);

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

  useEffect(() => {
    if (expenseData) {
      setExpenseData((prevState: any) => ({
        ...prevState,
        amount: prevState.subTotal + prevState.tax - prevState.discount,
        tax: prevState.tax,
        discount: prevState.discount,
        subTotal: prevState.subTotal,
      }));
    }
  }, [expenseData?.discount, expenseData?.subTotal, expenseData?.tax]);

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
    const newSubtotal = newPOItems.reduce((acc: number, item: IPOItem) => {
      return acc + item.costPerItem * (item.receivedQty || 0);
    }, 0);

    setUpdatedPOItems(newPOItems);

    setExpenseData({ ...expenseData, subTotal: newSubtotal });
  };

  const handleReceive = async () => {
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
          },
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.message);
        return;
      }

      showNotification('success', res.data.message);
      onClose();
      router.push(`/admin/purchase-orders`);
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
          <Box>
            {/* Discount */}
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography>Discount ($)</Typography>
              <TextField
                type="number"
                value={expenseData?.discount}
                fullWidth
                onChange={(e) =>
                  setExpenseData({ ...expenseData, discount: +e.target.value })
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
              onChange={(e) =>
                setExpenseData({ ...expenseData, subTotal: +e.target.value })
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Tax ($)</Typography>
            <TextField
              type="number"
              value={expenseData.tax}
              fullWidth
              onChange={(e) =>
                setExpenseData({ ...expenseData, tax: +e.target.value })
              }
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

          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Invoice</Typography>
            <TextField
              type="text"
              value={expenseData.invoice}
              fullWidth
              onChange={(e) =>
                setExpenseData({ ...expenseData, invoice: e.target.value })
              }
            />
          </Box>

          {/* Description */}
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>Description</Typography>
            <TextField
              type="text"
              value={expenseData.description}
              fullWidth
              onChange={(e) =>
                setExpenseData({ ...expenseData, description: e.target.value })
              }
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
