import {
  AlertColor,
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { API_URL } from '@/app/utils/enum';
import { IPaymentMethod } from '@/app/utils/type';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import { fetchApi, SWRFetchData } from '@/app/utils/db';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  defaultValue?: any;
  codBoardId?: number;
}

export default function AddExpense({
  open,
  onClose,
  showNotification,
  defaultValue,
  codBoardId
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState<any>({
    amount: 0,
    description: '',
    paymentMethodId: codBoardId ? 4 : -1,
    spentBy: '-- Choose who spent --',
    ...(defaultValue ? defaultValue : {}),
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const { date, SelectDate } = useSelectDate(
    defaultValue?.date ? defaultValue?.date : todayString,
    true,
  );

  useEffect(() => {
    fetchAdmins();
    fetchDrivers();
  }, []);

  const fetchAdmins = async () => {
    try {
      const admins = await fetchApi(
        `${API_URL.ADMIN}/admins`,
        showNotification,
      );

      const formattedAdmins = admins.map((admin: any) => {
        return `Admin - ${admin.clientName}`;
      });
      setAdminsAndDrivers((prevAdminAndDrivers) => [
        ...prevAdminAndDrivers,
        ...formattedAdmins,
      ]);
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      return;
    }
  };

  const fetchDrivers = async () => {
    try {
      const drivers = await fetchApi(
        `${API_URL.ADMIN}/drivers`,
        showNotification,
      );

      const formattedDrivers = drivers.map((driver: any) => {
        return `Driver - ${driver.name}`;
      });
      setAdminsAndDrivers((prevAdminAndDrivers) => [
        ...prevAdminAndDrivers,
        ...formattedDrivers,
      ]);
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      return;
    }
  };

  const handleAddExpense = async () => {
    try {
      setIsAdding(true);
      const createdAt = generateCurrentTime();

      let response;

      if (codBoardId) {
        response = await axios.post(`${API_URL.ADMIN}/cod/expenses`, {
          date,
        createdAt,
        createdBy: defaultValue.createdBy,
        spentBy: newExpense.spentBy,
        amount: newExpense.amount,
        description: newExpense.description,
        paymentMethodId: newExpense.paymentMethodId,
        codBoardId,
        })
      } else {
        response = await axios.post(`${API_URL.ADMIN}/expenses`, {
          date,
          createdAt,
          spentBy: newExpense.spentBy,
          amount: newExpense.amount,
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
        });

        }


      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsAdding(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsAdding(false);
      onClose();
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
      setIsAdding(false);
      return;
    }
  };

  const onChangeNewExpense = (field: string, value: any) => {
    setNewExpense({
      ...newExpense,
      [field]: value,
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight={'80vh'} overflow={'auto'}>
        <ModalHead
          heading="Add Expense"
          onClose={onClose}
          onClick={handleAddExpense}
          buttonProps={{
            loading: isAdding,
            disabled:
              newExpense.paymentMethodId === -1 ||
              newExpense.spentBy === '-- Choose who spent --',
          }}
          buttonLabel="ADD"
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
              value={newExpense.amount}
              type="number"
              onChange={(e) => onChangeNewExpense('amount', +e.target.value)}
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Description</Typography>
            <TextField
              multiline
              placeholder="Enter description..."
              fullWidth
              value={newExpense.description}
              onChange={(e) =>
                onChangeNewExpense('description', e.target.value)
              }
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Payment Method</Typography>
            {codBoardId ? (
              <Select
              value={newExpense.paymentMethodId}
              onChange={(e) =>
                onChangeNewExpense('paymentMethodId', +e.target.value)
              }
            >
              <MenuItem value={4} disabled>
                {paymentMethods?.data[0]?.name}
              </MenuItem>
              
            </Select>
            ) : <Select
              value={newExpense.paymentMethodId}
              onChange={(e) =>
                onChangeNewExpense('paymentMethodId', +e.target.value)
              }
            >
              <MenuItem value={-1} disabled>
                -- Choose payment method --
              </MenuItem>
              {paymentMethods &&
                paymentMethods?.data?.length > 0 &&
                paymentMethods?.data.map(
                  (paymentMethod: IPaymentMethod, index: number) => {
                    return (
                      <MenuItem key={index} value={paymentMethod.id}>
                        {paymentMethod.name}
                      </MenuItem>
                    );
                  },
                )}
            </Select>}
          </Box>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Spent By</Typography>
            <Select
              value={newExpense.spentBy}
              onChange={(e) => onChangeNewExpense('spentBy', e.target.value)}
            >
              <MenuItem value="-- Choose who spent --" disabled>
                -- Choose who spent --
              </MenuItem>
              {adminsAndDrivers.length > 0 &&
                adminsAndDrivers.map((adminOrDriver: string, index: number) => (
                  <MenuItem key={index} value={adminOrDriver}>
                    {adminOrDriver}
                  </MenuItem>
                ))}
            </Select>
          </Box>
        </Box>
      </BoxModal>
    </Modal>
  );
}
