import {
  Divider,
  Grid,
  Modal,
  Select,
  Typography,
  TextField,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
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
import { pstRate } from '@/app/lib/constant';
import { gstRate } from '@/app/lib/constant';
import useSelectExpenseType from '@/hooks/select/useSelectExpenseType';
import { IFixedTransaction } from '@/app/utils/type';
interface IProps extends ModalProps {
  fixedTransaction: IFixedTransaction;
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
  const [updatedTransaction, setUpdatedTransaction] = useState<
    IFixedTransaction | any
  >(fixedTransaction);

  const { selectedEmployee, renderEmployeeSearch } = useEmployee(
    updatedTransaction?.defaultSpentBy || undefined,
  );

  const { selectedExpenseType, renderExpenseTypeSearch } = useSelectExpenseType(companyId, fixedTransaction?.type);

  useEffect(() => {
    if (fixedTransaction) {
      setUpdatedTransaction({
        ...fixedTransaction,
        hasGST:
          fixedTransaction?.defaultGST && fixedTransaction?.defaultGST > 0
            ? true
            : false,
        hasPST:
          fixedTransaction?.defaultPST && fixedTransaction?.defaultPST > 0
            ? true
            : false,
      });
    }
  }, [fixedTransaction]);

  useEffect(() => {
      const gst =
      Math.round(
        (updatedTransaction?.hasGST
          ? (updatedTransaction?.defaultSubtotal - (updatedTransaction?.discount || 0)) * gstRate
          : 0) * 100,
      ) / 100;
    const pst =
      Math.round(
        (updatedTransaction?.hasPST
          ? (updatedTransaction?.defaultSubtotal - (updatedTransaction?.discount || 0)) * pstRate
          : 0) * 100,
      ) / 100;
      setUpdatedTransaction((prevState: any) => ({
        ...prevState,
        defaultGST: gst,
        defaultPST: pst,
        defaultAmount: prevState?.defaultSubtotal + gst + pst - (updatedTransaction?.discount || 0) ,
      }));
  }, [
    updatedTransaction?.hasGST,
    updatedTransaction?.hasPST,
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
            typeId: selectedExpenseType?.id,
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
            <Typography variant="body1">Expense Type</Typography>
            {renderExpenseTypeSearch()}
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
                      checked={updatedTransaction?.hasGST || false}
                      onChange={(e) =>
                        setUpdatedTransaction({
                          ...updatedTransaction,
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
                      checked={updatedTransaction?.hasPST || false}
                      onChange={(e) =>
                        setUpdatedTransaction({
                          ...updatedTransaction,
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
              value={updatedTransaction?.defaultSubtotal}
              onChange={(e: any) => {
                setUpdatedTransaction({
                  ...updatedTransaction,
                  defaultSubtotal: +e.target.value,
                });
              }}
              sx={{ width: '100%' }}
              type="number"
              fullWidth
            />
          </Grid>

          {(updatedTransaction?.hasGST || updatedTransaction?.hasPST) && (
            <Grid item xs={12} display="flex" alignItems="center" gap={1}>
              <Typography>
                GST (5%): {updatedTransaction?.defaultGST?.toFixed(2) || 0}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Typography>
                PST (7%): {updatedTransaction?.defaultPST?.toFixed(2) || 0}
              </Typography>
            </Grid>
          )}

          {/* <Grid item xs={6} display="flex" gap={1} flexDirection="column">
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
          </Grid> */}

          <Grid item xs={12} display="flex" flexDirection="column" gap={1}>
            <Typography variant="body1">Default Total</Typography>
            <TextField
              value={updatedTransaction?.defaultAmount}
              onChange={(e: any) => {
                setUpdatedTransaction({
                  ...updatedTransaction,
                  defaultAmount: +e.target.value,
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
