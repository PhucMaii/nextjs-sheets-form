import {
  AlertColor,
  Box,
  Divider,
  Grid,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { IExpense, IPaymentMethod } from '@/app/utils/type';
import { getAdminApiUrl } from '@/app/utils/enum';
import axios from 'axios';
import { SWRFetchData } from '@/app/utils/db';
import { ModalProps } from '../type';
import { useParams } from 'next/navigation';
// import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';

interface IProps extends ModalProps {
  transaction: IExpense;
  // paymentMethods: IPaymentMethod[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditExpense({
  transaction,
  // paymentMethods,
  showNotification,
  open,
  onClose,
}: IProps) {
  const { companyId }: any = useParams();
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [open, setOpen] = useState<boolean>(false);
  const [updatedExpense, setUpdatedExpense] = useState<IExpense>(transaction);
  const { date, SelectDate } = useSelectDate(transaction?.date, true);

  const [paymentMethods] = SWRFetchData(
    getAdminApiUrl(companyId, '/paymentMethods'),
  );
  const [adminsAndDriversRes] = SWRFetchData(
    getAdminApiUrl(companyId, '/adminsAndDrivers'),
  );

  useEffect(() => {
    if (transaction) {
      setUpdatedExpense(transaction);
    }
  }, [transaction]);

  useEffect(() => {
    if (updatedExpense) {
      setUpdatedExpense((prevState: any) => ({
        ...prevState,
        amount:
          prevState?.subTotal +
          prevState.GST +
          prevState.PST -
          (prevState?.discount || 0),
      }));
    }
  }, [updatedExpense?.discount]);

  const onChangeExpense = (field: string, value: any) => {
    setUpdatedExpense({
      ...updatedExpense,
      [field]: value,
    });
  };

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  const handleUpdateExpense = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(getAdminApiUrl(companyId, '/expenses'), {
        id: updatedExpense.id,
        date: date,
        amount: updatedExpense.amount,
        subTotal: updatedExpense.subTotal,
        discount: updatedExpense?.discount || 0,
        GST: updatedExpense.GST,
        PST: updatedExpense.PST,
        description: updatedExpense.description,
        paymentMethodId: updatedExpense.paymentMethodId,
        spentBy: updatedExpense.spentBy,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      setIsLoading(false);
      return;
    }
  };

  return (
    <>
      {/* <Button onClick={() => setOpen(true)}>Edit</Button> */}

      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Edit Expense"
            buttonLabel="EDIT"
            onClose={onClose}
            onClick={handleUpdateExpense}
            buttonProps={{
              loading: isLoading,
            }}
          />

          <Divider sx={{ my: 2 }} />

          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Date</Typography>
              {SelectDate}
            </Box>
            {/* <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Amount</Typography>
              <TextField
                placeholder="Enter epxense amount..."
                fullWidth
                value={updatedExpense.amount}
                type="number"
                onChange={(e) => onChangeExpense('amount', +e.target.value)}
              />
            </Box> */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="h6">Discount</Typography>
                  <TextField
                    placeholder="Discount"
                    fullWidth
                    type="number"
                    value={updatedExpense?.discount || 0}
                    onChange={(e) =>
                      onChangeExpense('discount', +e.target.value)
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="h6">Subtotal</Typography>
                  <TextField
                    label="Subtotal"
                    placeholder="Subtotal"
                    fullWidth
                    value={updatedExpense?.subTotal || 0}
                    type="number"
                    onChange={(e) =>
                      onChangeExpense('subTotal', +e.target.value)
                    }
                  />
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="h6">GST (5%)</Typography>
                  <TextField
                    placeholder="GST (5%)"
                    fullWidth
                    value={updatedExpense?.GST || 0}
                    type="number"
                    onChange={(e) => onChangeExpense('GST', +e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item md={6} xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="h6">PST (7%)</Typography>
                  <TextField
                    placeholder="PST (7%)"
                    fullWidth
                    value={updatedExpense?.PST || 0}
                    type="number"
                    onChange={(e) => onChangeExpense('PST', +e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Typography variant="h6">Total</Typography>
                  <TextField
                    placeholder="Total"
                    fullWidth
                    value={updatedExpense?.amount}
                    type="number"
                    onChange={(e) => onChangeExpense('amount', +e.target.value)}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Description</Typography>
              <TextField
                multiline
                placeholder="Enter description..."
                fullWidth
                value={updatedExpense?.description}
                onChange={(e) => onChangeExpense('description', e.target.value)}
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Payment Method</Typography>
              <Select
                size="small"
                value={updatedExpense?.paymentMethodId}
                onChange={(e: any) =>
                  onChangeExpense('paymentMethodId', +e.target.value)
                }
              >
                <MenuItem value={-1} disabled>
                  -- Choose payment method --
                </MenuItem>
                {paymentMethods &&
                  paymentMethods?.data.length > 0 &&
                  paymentMethods?.data.map(
                    (paymentMethod: IPaymentMethod, index: number) => {
                      return (
                        <MenuItem key={index} value={paymentMethod.id}>
                          {paymentMethod.name}
                        </MenuItem>
                      );
                    },
                  )}
              </Select>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Spent By</Typography>
              <Select
                size="small"
                value={updatedExpense?.spentBy}
                onChange={(e) => onChangeExpense('spentBy', e.target.value)}
              >
                <MenuItem value="-- Choose who spent --" disabled>
                  -- Choose who spent --
                </MenuItem>
                {adminsAndDrivers &&
                  adminsAndDrivers.length > 0 &&
                  adminsAndDrivers.map(
                    (adminOrDriver: string, index: number) => (
                      <MenuItem key={index} value={adminOrDriver}>
                        {adminOrDriver}
                      </MenuItem>
                    ),
                  )}
              </Select>
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
