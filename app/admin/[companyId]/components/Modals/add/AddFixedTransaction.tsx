import {
  Typography,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
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
import { mainPaymentMethodId } from '@/app/lib/constant';
import dayjs from 'dayjs';
import { fetchApi } from '@/app/utils/db';
import { useParams } from 'next/navigation';
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
    paymentMethodId: -1,
    defaultSubtotal: 0,
    defaultPST: 0,
    defaultGST: 0,
    defaultAmount: 0,
    defaultSpentBy: '',
    defaultTransactionStatus: TRANSACTION_STATUS.PAID,
  });

  const { selectedEmployee, renderEmployeeSearch } = useEmployee();

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
    // if (newFixedTransaction?.defaultSubtotal) {
    setNewFixedTransaction({
      ...newFixedTransaction,
      defaultAmount:
        (newFixedTransaction?.defaultSubtotal || 0) +
        (newFixedTransaction.defaultPST || 0) +
        (newFixedTransaction.defaultGST || 0),
    });
    // }
  }, [
    newFixedTransaction?.defaultSubtotal,
    newFixedTransaction?.defaultPST,
    newFixedTransaction?.defaultGST,
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
          {/* <Grid
            item
            xs={12}
            display="flex"
            alignItems="flex-end"
            gap={1}
            flexDirection="column"
          >
            <FormControlLabel
              control={<Checkbox />}
              label="Is Dynamic Amount"
            />
          </Grid> */}

          <Grid item xs={12} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default Subtotal</Typography>
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

          <Grid item xs={6} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default PST</Typography>
            <TextField
              label="PST"
              fullWidth
              value={newFixedTransaction.defaultPST}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  defaultPST: +e.target.value,
                })
              }
              type="number"
            />
          </Grid>

          <Grid item xs={6} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default GST</Typography>
            <TextField
              label="GST"
              fullWidth
              value={newFixedTransaction.defaultGST}
              onChange={(e) =>
                setNewFixedTransaction({
                  ...newFixedTransaction,
                  defaultGST: +e.target.value,
                })
              }
              type="number"
            />
          </Grid>

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
