import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { ShowNotificationType } from '@/hooks/useNotification';
import { IPaymentMethod, IPayroll } from '@/app/utils/type';
import { BoxModal } from './styled';
import { Divider, Modal } from '@mui/material';
import ModalHead from '@/app/lib/ModalHead';
import OtherExpense from '../Expense/OtherExpense';
import { getAdminApiUrl, TRANSACTION_STATUS } from '@/app/utils/enum';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { YYYYMMDDFormat } from '@/app/utils/time';
import useSelectDate from '@/hooks/useSelectDate';
import { mainPaymentMethodId, months } from '@/app/lib/constant';

interface IProps extends ModalProps {
  showNotification: ShowNotificationType;
  payrolls: IPayroll[];
}

export default function ConvertPayroll({
  open,
  onClose,
  showNotification,
  payrolls,
}: IProps) {
  const { companyId }: any = useParams();
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState<any>({
    description: '',
    paymentMethodId: mainPaymentMethodId,
    spentBy: 'S Admin - Bao Bao',
    status: TRANSACTION_STATUS.PAID,
  });

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const { date, SelectDate } = useSelectDate(todayString, true);

  useEffect(() => {
    fetchPaymentMethods();
    fetchAdminsAndDrivers();
  }, []);

  useEffect(() => {
    if (payrolls.length > 0) {
      const total = payrolls.reduce((acc, payroll) => acc + payroll.total, 0);
      const month = payrolls[0]?.startDate?.split('/')[0];
      const monthText = months[+month - 1];
      setNewExpense({
        ...newExpense,
        amount: total,
        subTotal: total,
        description: `Payment for ${payrolls.length} payrolls in ${monthText}`,
      });
    }
  }, [payrolls]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        getAdminApiUrl(companyId, '/paymentMethods'),
      );
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
      const response = await axios.get(
        getAdminApiUrl(companyId, '/adminsAndDrivers'),
      );
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

  const handleConvert = async () => {
    try {
      const response = await axios.post(
        getAdminApiUrl(companyId, '/payroll/to-transaction'),
        {
          payrollIds: payrolls.map((payroll) => payroll.id),
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
          spentBy: newExpense.spentBy,
          status: newExpense.status,
          date: date,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      onClose();
    } catch (error: any) {
      console.error('Error converting payroll:', error);
      showNotification('error', 'Error converting payroll: ' + error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal maxHeight="90vh" overflow="auto">
        <ModalHead
          heading="Convert To Transaction"
          buttonLabel="Convert"
          onClick={() => {}}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <OtherExpense
          paymentMethods={paymentMethods}
          adminsAndDrivers={adminsAndDrivers}
          SelectDate={SelectDate}
          onChangeNewExpense={onChangeNewExpense}
          newExpense={newExpense}
          handleAddExpense={handleConvert}
        />
      </BoxModal>
    </Modal>
  );
}
