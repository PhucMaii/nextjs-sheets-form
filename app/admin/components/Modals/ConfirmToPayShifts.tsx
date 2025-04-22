import { AlertColor, Modal } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import ModalHead from '@/app/lib/ModalHead';
import OtherExpense from '../Expense/OtherExpense';
import { SHIFT_STATUS, TRANSACTION_STATUS } from '@/app/utils/enum';
import { YYYYMMDDFormat } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import { API_URL } from '@/app/utils/enum';
import { mainPaymentMethodId, months } from '@/app/lib/constant';
import axios from 'axios';
import { IShiftSession } from '@/app/utils/type';

interface IProps extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  shifts: IShiftSession[];
  onClearSelectedShifts: () => void;
}

export default function ConfirmToPayShifts({
  open,
  onClose,
  shifts,
  showNotification,
  onClearSelectedShifts,
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState<any>({
    amount: 0,
    GST: 0,
    PST: 0,
    subTotal: 0,
    description: '',
    paymentMethodId: mainPaymentMethodId,
    spentBy: 'Admin - Tim Le',
    status: TRANSACTION_STATUS.PAID,
  });

  const unpaidShifts = useMemo(() => {
    return shifts.filter(
      (shift: IShiftSession) => shift.status === SHIFT_STATUS.UNPAID,
    );
  }, [shifts]);

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const { date, SelectDate } = useSelectDate(todayString, true);

  useEffect(() => {
    if (unpaidShifts) {
      const month = unpaidShifts[0]?.date.split('/')[0];
      const monthWord = months[+month - 1];

      const totalCosts = unpaidShifts.reduce((acc, shift) => {
        return acc + (shift?.cost || 0);
      }, 0);
      setNewExpense((prevExpense: any) => ({
        ...prevExpense,
        subTotal: Number(totalCosts.toFixed(2)),
        description: `Payment for ${unpaidShifts.length} shifts in ${monthWord}`,
        date: date,
      }));
    }
  }, [unpaidShifts]);

  useEffect(() => {
    if (open) {
      fetchAdminsAndDrivers();
      fetchPaymentMethods();
    }
  }, [open]);

  useEffect(() => {
    if (newExpense.subTotal) {
      setNewExpense((prevExpense: any) => ({
        ...prevExpense,
        amount: newExpense.subTotal + newExpense.GST + newExpense.PST,
      }));
    }
  }, [newExpense.PST, newExpense.GST, newExpense.subTotal]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/paymentMethods`);
      //   if (response.data.data) {
      setPaymentMethods(response.data.data);
      //   }
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      showNotification(
        'error',
        'Error fetching payment methods: ' + error.message,
      );
    }
  };

  const fetchAdminsAndDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL.ADMIN}/adminsAndDrivers`);
      if (response.data.data) {
        setAdminsAndDrivers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching admins and drivers:', error);
      showNotification(
        'error',
        'Error fetching admins and drivers: ' + error.message,
      );
    }
  };

  const handleAddExpense = async () => {
    try {
      setIsAdding(true);
      const response = await axios.post(`${API_URL.ADMIN}/shifts/payment`, {
        newExpense,
        shifts: unpaidShifts,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error) {
      console.log(error);
      showNotification('error', 'Something went wrong');
    } finally {
      setIsAdding(false);
      onClearSelectedShifts();
    }
  };

  const onChangeNewExpense = (field: string, value: any) => {
    if (field === 'paymentMethodId' && value === mainPaymentMethodId) {
      setNewExpense({
        ...newExpense,
        [field]: value,
        status: TRANSACTION_STATUS.PAID,
      });
    } else {
      setNewExpense({
        ...newExpense,
        [field]: value,
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="80vh" overflow="scroll">
        <ModalHead
          heading="Confirm to Pay Shifts"
          buttonLabel="CONFIRM"
          onClick={() => {}}
          buttonProps={{
            loading: isAdding,
          }}
          onClose={onClose}
          onlyHeading
        />

        <OtherExpense
          paymentMethods={paymentMethods}
          adminsAndDrivers={adminsAndDrivers}
          SelectDate={SelectDate}
          onChangeNewExpense={onChangeNewExpense}
          newExpense={newExpense}
          handleAddExpense={handleAddExpense}
        />
      </BoxModal>
    </Modal>
  );
}
