import {
  Typography,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import React, { useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { IFixedTransaction } from '@/app/utils/type';
import { API_URL, FIXED_TRANSACTION_STATUS, RECURRENCE_TYPE, TRANSACTION_STATUS } from '@/app/utils/enum';
import useSelectDate from '@/hooks/useSelectDate';
import useEmployee from '@/hooks/select/useEmployee';
import SelectExpenseStatus from '../../Select/SelectExpenseStatus';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { mainPaymentMethodId } from '@/app/lib/constant';
import dayjs from 'dayjs';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newFixedTransaction, setNewFixedTransaction] = useState<
    IFixedTransaction | any
  >({
    title: '',
    recurrence: RECURRENCE_TYPE.MONTHLY,
    isDynamicAmount: false,
    paymentMethodId: mainPaymentMethodId,
    defaultSubtotal: 0,
    defaultPST: 0,
    defaultGST: 0,
    defaultTotal: 0,
    defaultSpentBy: '',
    defaultTransactionStatus: TRANSACTION_STATUS.PAID,
  });

  const { selectedEmployee, renderEmployeeSearch } = useEmployee();

  const { date: initialDueDate, SelectDate } = useSelectDate(
    defaultDate || '',
    true,
    true,
  );

  const handleCreateTransaction = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL.ADMIN}/fixed-transactions`, {
        ...newFixedTransaction,
        defaultSpentBy: selectedEmployee,
        initialDueDate: dayjs(initialDueDate).format('MM/DD/YYYY'),
      });

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      await refresh();
      
      showNotification('success', 'Fixed transaction created successfully');
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error', error);
      showNotification('error', error.response.data.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

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
            <Typography variant="body1">Initial Due Date</Typography>
            {SelectDate}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }}>Payment Info</Divider>

        <Grid container spacing={2}>
          <Grid
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
          </Grid>

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
              />
            </Grid>

            <Grid item xs={12} display="flex" gap={1} flexDirection="column">
              <Typography variant="body1">Default Total</Typography>
              <TextField
                label="Total"
                fullWidth
                value={newFixedTransaction.defaultAmount}
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
