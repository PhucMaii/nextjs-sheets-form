import {
  Divider,
  Grid,
  Modal,
  Select,
  Typography,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { FixedTransaction } from '@prisma/client';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import {
  FIXED_TRANSACTION_STATUS,
  RECURRENCE_TYPE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import useEmployee from '@/hooks/select/useEmployee';
import SelectExpenseStatus from '../../Select/SelectExpenseStatus';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import { Trash2Icon } from 'lucide-react';
import { grey } from '@mui/material/colors';
import { useParams } from 'next/navigation';
interface IProps extends ModalProps {
  fixedTransaction: FixedTransaction;
  showNotification: ShowNotificationType;
  refresh: () => Promise<void>;
}

export default function EditFixedTransaction({
  open,
  onClose,
  fixedTransaction,
  showNotification,
  refresh,
}: IProps) {
  const { companyId }: any = useParams();

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
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

  useEffect(() => {
    if (updatedTransaction?.defaultSubtotal) {
      setUpdatedTransaction({
        ...updatedTransaction,
        defaultAmount:
          updatedTransaction.defaultSubtotal +
          (updatedTransaction.defaultPST || 0) +
          (updatedTransaction.defaultGST || 0),
      });
    }
  }, [
    updatedTransaction?.defaultSubtotal,
    updatedTransaction?.defaultPST,
    updatedTransaction?.defaultGST,
  ]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.delete(
        getAdminApiUrl(companyId, '/fixed-transactions'),
        {
          params: { id: fixedTransaction.id },
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      showNotification('success', 'Fixed transaction deleted successfully');
      onClose();
      refresh();
    } catch (error: any) {
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const res = await axios.put(
        getAdminApiUrl(companyId, '/fixed-transactions'),
        {
          id: fixedTransaction.id,
          updatedTransaction: {
            ...updatedTransaction,
            defaultSpentBy: selectedEmployee,
          },
        },
      );

      if (res.data.error) {
        showNotification('error', res.data.error);
        return;
      }

      showNotification('success', 'Fixed transaction updated successfully');
      onClose();
      refresh();
    } catch (error: any) {
      showNotification('error', 'Something went wrong: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead
          heading="Edit Fixed Transaction"
          buttonLabel="Save"
          onClick={handleUpdate}
          buttonProps={{
            loading: isUpdating,
          }}
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
                  defaultSubtotal: +e.target.value,
                });
              }}
              sx={{ width: '100%' }}
              type="number"
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
              type="number"
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
              type="number"
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
              type="number"
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

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <LoadingButton
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Typography
                  variant="body1"
                  color={grey[500]}
                  fontWeight="semibold"
                >
                  Deleting...
                </Typography>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Trash2Icon />
                  <Typography
                    variant="body1"
                    color="error"
                    fontWeight="semibold"
                  >
                    Delete
                  </Typography>
                </Box>
              )}
            </LoadingButton>
          </Grid>
        </Grid>
      </BoxModal>
    </Modal>
  );
}
