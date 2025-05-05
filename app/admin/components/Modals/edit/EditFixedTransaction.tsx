import {
  Divider,
  Grid,
  Modal,
  Select,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { FixedTransaction } from '@prisma/client';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { FIXED_TRANSACTION_STATUS, RECURRENCE_TYPE } from '@/app/utils/enum';
import useEmployee from '@/hooks/select/useEmployee';
import SelectExpenseStatus from '../../Select/SelectExpenseStatus';

interface IProps extends ModalProps {
  fixedTransaction: FixedTransaction;
}

export default function EditFixedTransaction({
  open,
  onClose,
  fixedTransaction,
}: IProps) {
  const [updatedTransaction, setUpdatedTransaction] =
    useState<FixedTransaction>(fixedTransaction);

  const { selectedEmployee, renderEmployeeSearch } = useEmployee(
    updatedTransaction?.defaultSpentBy || undefined,
  );

  useEffect(() => {
    if (fixedTransaction) {
      setUpdatedTransaction(fixedTransaction);
    }
  }, [fixedTransaction]);
  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead
          heading="Edit Fixed Transaction"
          buttonLabel="Save"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Title</Typography>
            <Typography variant="h5">{fixedTransaction?.title}</Typography>
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Recurrence</Typography>
            <Select
              value={updatedTransaction?.recurrence}
              onChange={(e: any) =>
                setUpdatedTransaction({
                  ...updatedTransaction,
                  recurrence: e.target.value,
                })
              }
              sx={{ width: '100%' }}
            >
              {Object.values(RECURRENCE_TYPE).map((recurrence) => (
                <MenuItem key={recurrence} value={recurrence}>
                  {recurrence}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Default Subtotal</Typography>
            <TextField
              value={updatedTransaction?.defaultSubtotal}
              onChange={(e: any) => {
                setUpdatedTransaction({
                  ...updatedTransaction,
                  defaultSubtotal: e.target.value,
                });
              }}
              sx={{ width: '100%' }}
            />
          </Grid>

          <Grid item xs={6} display="flex" gap={1} flexDirection="column">
            <Typography variant="body1">Default PST</Typography>
            <TextField
              label="PST"
              fullWidth
              value={updatedTransaction.defaultPST}
              onChange={(e) =>
                setUpdatedTransaction({
                  ...updatedTransaction,
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
              value={updatedTransaction.defaultGST}
              onChange={(e) =>
                setUpdatedTransaction({
                  ...updatedTransaction,
                  defaultGST: +e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Default Total</Typography>
            <TextField
              value={updatedTransaction?.defaultAmount}
              onChange={(e: any) => {
                setUpdatedTransaction({
                  ...updatedTransaction,
                  defaultAmount: e.target.value,
                });
              }}
              sx={{ width: '100%' }}
            />
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Default Spent By</Typography>
            {renderEmployeeSearch()}
          </Grid>

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography>Default Transaction Status</Typography>
            <SelectExpenseStatus
              value={updatedTransaction.defaultTransactionStatus}
              onChange={(e: any) =>
                setUpdatedTransaction({
                  ...updatedTransaction,
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
