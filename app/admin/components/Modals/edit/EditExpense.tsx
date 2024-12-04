import {
  AlertColor,
  Box,
  Button,
  Divider,
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
import { API_URL } from '@/app/utils/enum';
import axios from 'axios';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';

interface IProps {
  transaction: IExpense;
  // paymentMethods: IPaymentMethod[];
  showNotification: (type: AlertColor, message: string) => void;
}

export default function EditExpense({
  transaction,
  // paymentMethods,
  showNotification,
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [updatedExpense, setUpdatedExpense] = useState<IExpense>(transaction);
  const { date, SelectDate } = useSelectDate(transaction.date, true);

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);

  useEffect(() => {
    if (transaction) {
      setUpdatedExpense(transaction);
    }
  }, [transaction]);

  const onChangeExpense = (field: string, value: any) => {
    setUpdatedExpense({
      ...updatedExpense,
      [field]: value,
    });
  };

  const fetchAdminsAndDrivers = async () => {
    const user: any = await getAdminsAndDrivers(showNotification);
    setAdminsAndDrivers(user);
  };

  useEffect(() => {
    if (open) {
      fetchAdminsAndDrivers();
    }
  }, [open]);

  // const fetchAdmins = async () => {
  //   try {
  //     const admins = await fetchApi(
  //       `${API_URL.ADMIN}/admins`,
  //       showNotification,
  //     );

  //     const formattedAdmins = admins.map((admin: any) => {
  //       return `Admin - ${admin.clientName}`;
  //     });
  //     setAdminsAndDrivers(formattedAdmins);
  //   } catch (error) {
  //     console.log(error);
  //     showNotification('error', 'Something went wrong');
  //     return;
  //   }
  // };

  // const fetchDrivers = async () => {
  //   try {
  //     const drivers = await fetchApi(
  //       `${API_URL.ADMIN}/drivers`,
  //       showNotification,
  //     );

  //     const formattedDrivers = drivers.map((driver: any) => {
  //       return `Driver - ${driver.name}`;
  //     });
  //     setAdminsAndDrivers((prevAdminAndDrivers) => [
  //       ...prevAdminAndDrivers,
  //       ...formattedDrivers,
  //     ]);
  //   } catch (error) {
  //     console.log(error);
  //     showNotification('error', 'Something went wrong');
  //     return;
  //   }
  // };

  const handleUpdateExpense = async () => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL.ADMIN}/expenses`, {
        id: updatedExpense.id,
        date: date,
        amount: updatedExpense.amount,
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
      setOpen(false);
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
      <Button onClick={() => setOpen(true)}>Edit</Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <BoxModal>
          <ModalHead
            heading="Edit Expense"
            buttonLabel="EDIT"
            onClose={() => setOpen(false)}
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
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Amount</Typography>
              <TextField
                placeholder="Enter epxense amount..."
                fullWidth
                value={updatedExpense.amount}
                type="number"
                onChange={(e) => onChangeExpense('amount', +e.target.value)}
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Description</Typography>
              <TextField
                multiline
                placeholder="Enter description..."
                fullWidth
                value={updatedExpense.description}
                onChange={(e) => onChangeExpense('description', e.target.value)}
              />
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h6">Payment Method</Typography>
              <Select
                value={updatedExpense.paymentMethodId}
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
                value={updatedExpense.spentBy}
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
