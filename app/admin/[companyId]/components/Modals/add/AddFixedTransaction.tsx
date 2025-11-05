import {
  Typography,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IFixedTransaction, IPaymentMethod } from '@/app/utils/type';
import {
  FIXED_TRANSACTION_STATUS,
  RECURRENCE_TYPE,
  TRANSACTION_STATUS,
  getAdminApiUrl,
} from '@/app/utils/enum';
import useSelectDate from '@/hooks/useSelectDate';
import useEmployee from '@/hooks/select/useEmployee';
import SelectExpenseStatus from '../../Select/SelectExpenseStatus';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { gstRate, mainPaymentMethodId, pstRate } from '@/app/lib/constant';
import dayjs from 'dayjs';
import { fetchApi } from '@/app/utils/db';
import { useParams } from 'next/navigation';
import useSelectExpenseType from '@/hooks/select/useSelectExpenseType';
interface IProps extends ModalProps {
  defaultDate?: string;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function AddFixedTransaction({
  open,
  onClose,
  defaultDate,
  showNotification,
  refresh,
}: IProps) {
  const { companyId }: any = useParams();

  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newFixedTransaction, setNewFixedTransaction] = useState<
    IFixedTransaction | any
  >({
    title: '',
    recurrence: RECURRENCE_TYPE.MONTHLY,
    typeId: -1,
    paymentMethodId: -1,
    defaultSubtotal: 0,
    defaultPST: 0,
    defaultGST: 0,
    defaultAmount: 0,
    defaultSpentBy: '',
    defaultTransactionStatus: TRANSACTION_STATUS.PAID,
  });

  const { selectedEmployee, renderEmployeeSearch } = useEmployee();
  const { selectedExpenseType, renderExpenseTypeSearch } = useSelectExpenseType(companyId);

  const { date: initialDueDate, SelectDate } = useSelectDate(
    defaultDate || '',
    true,
    true,
    true,
  );

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    if (open) {
      setNewFixedTransaction({
        title: '',
        recurrence: RECURRENCE_TYPE.MONTHLY,
        typeId: -1,
        paymentMethodId: mainPaymentMethodId,
        defaultSubtotal: 0,
        defaultPST: 0,
        defaultGST: 0,
        defaultAmount: 0,
        defaultSpentBy: '',
        defaultTransactionStatus: TRANSACTION_STATUS.PAID,
      });
    }
  }, [open]);

  useEffect(() => {
      const gst =
        Math.round(
          (newFixedTransaction?.hasGST
            ? (newFixedTransaction?.defaultSubtotal - (newFixedTransaction?.discount || 0)) * gstRate
            : 0) * 100,
        ) / 100;
      const pst =
        Math.round(
          (newFixedTransaction?.hasPST
            ? (newFixedTransaction?.defaultSubtotal - (newFixedTransaction?.discount || 0)) * pstRate
            : 0) * 100,
        ) / 100;

      setNewFixedTransaction((prevState: any) => ({
        ...prevState,
        defaultGST: gst,
        defaultPST: pst,
        defaultAmount: prevState?.defaultSubtotal + gst + pst - (prevState?.discount || 0),
      }));
  }, [
    newFixedTransaction?.defaultSubtotal,
    newFixedTransaction?.hasGST,
    newFixedTransaction?.hasPST,
  ]);

  const fetchPaymentMethods = async () => {
    const data = await fetchApi(getAdminApiUrl(companyId, '/paymentMethods'));
    setPaymentMethods(data);
  };

  const handleCreateTransaction = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(
        getAdminApiUrl(companyId, '/fixed-transactions'),
        {
          ...newFixedTransaction,
          defaultSpentBy: selectedEmployee,
          initialDueDate: dayjs(initialDueDate).format('MM/DD/YYYY'),
          typeId: selectedExpenseType?.id,
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      await refresh();

      showNotification('success', 'Fixed transaction created successfully');
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error', error);
      showNotification(
        'error',
        error.response.data.error || 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="auto">
        <ModalHead
          heading="Create Fixed Transaction"
          buttonLabel="Create"
          onClick={handleCreateTransaction}
          buttonProps={{ loading: isLoading }}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }}>Basic Info</Divider>

        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Title</Typography>
            <TextField
              label="Title"
              fullWidth
              value={newFixedTransaction.title}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  title: e.target.value,
                })
              }
              placeholder="Rent, Hydro, etc."
            />
          </Grid>
          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Expense Type</Typography>
            {renderExpenseTypeSearch()}
          </Grid>

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Recurrence</Typography>
            <Select
              fullWidth
              value={newFixedTransaction.recurrence}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  recurrence: e.target.value as RECURRENCE_TYPE,
                })
              }
            >
              {Object.values(RECURRENCE_TYPE).map(
                (recurrence: RECURRENCE_TYPE) => (
                  <MenuItem key={recurrence} value={recurrence}>
                    {recurrence}
                  </MenuItem>
                ),
              )}
            </Select>
          </Grid>

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Next Due Date</Typography>
            {SelectDate}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>Payment Info</Divider>

        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography variant="body1">Default Subtotal</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newFixedTransaction?.hasGST || false}
                      onChange={(e) =>
                        setNewFixedTransaction({
                          ...newFixedTransaction,
                          hasGST: e.target.checked,
                        })
                      }
                    />
                  }
                  label="GST (5%)"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newFixedTransaction?.hasPST || false}
                      onChange={(e) =>
                        setNewFixedTransaction({
                          ...newFixedTransaction,
                          hasPST: e.target.checked,
                        })
                      }
                    />
                  }
                  label="PST (7%)"
                />
              </Box>
            </Box>
            <TextField
              label="Subtotal"
              fullWidth
              value={newFixedTransaction.defaultSubtotal}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  defaultSubtotal: +e.target.value,
                })
              }
              type="number"
            />
          </Grid>

          {(newFixedTransaction?.hasGST || newFixedTransaction?.hasPST) && (
            <Grid item xs={12} display="flex" gap={1} alignItems="center">
              <Typography>
                GST (5%): {newFixedTransaction?.defaultGST?.toFixed(2) || 0}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Typography>
                PST (7%): {newFixedTransaction?.defaultPST?.toFixed(2) || 0}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default Total</Typography>
            <TextField
              label="Total"
              fullWidth
              value={newFixedTransaction.defaultAmount}
              type="number"
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  defaultAmount: +e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default Spent By</Typography>
            {renderEmployeeSearch()}
          </Grid>

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default Payment Method</Typography>
            <Select
              value={newFixedTransaction.paymentMethodId}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  paymentMethodId: +e.target.value,
                })
              }
            >
              <MenuItem value={-1} disabled>
                -- Choose payment method --
              </MenuItem>
              {paymentMethods?.length > 0 &&
                paymentMethods.map(
                  (paymentMethod: IPaymentMethod, index: number) => {
                    return (
                      <MenuItem
                        key={index}
                        value={paymentMethod.id}
                        // disabled={paymentMethod.id !== mainPaymentMethodId}
                      >
                        {paymentMethod.name}
                      </MenuItem>
                    );
                  },
                )}
            </Select>
          </Grid>

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default Transaction Status</Typography>
            <SelectExpenseStatus
              value={newFixedTransaction.defaultTransactionStatus}
              onChange={(e: any) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  defaultTransactionStatus: e.target
                    .value as FIXED_TRANSACTION_STATUS,
                })
              }
            />
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
