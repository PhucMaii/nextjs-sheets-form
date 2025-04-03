import { AlertColor, Modal, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { API_URL, TRANSACTION_STATUS, USER_ROLE } from '@/app/utils/enum';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import { SWRFetchData } from '@/app/utils/db';
import StockPurchased from '../../Expense/StockPurchased';
import OtherExpense from '../../Expense/OtherExpense';
// import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';
import { mainPaymentMethodId } from '@/app/lib/constant';

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
  codBoardId,
}: IProps) {
  const [adminsAndDrivers, setAdminsAndDrivers] = useState<string[]>([]);
  const [currentTabIndex, setCurrentTabIndex] = useState<number>(0);
  const [newExpense, setNewExpense] = useState<any>({
    amount: 0,
    GST: 0,
    PST: 0,
    subTotal: 0,
    description: '',
    paymentMethodId: codBoardId ? 4 : -1,
    spentBy: '-- Choose who spent --',
    status: TRANSACTION_STATUS.UNPAID,
    ...(defaultValue ? defaultValue : {}),
  });

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);
  const [adminsAndDriversRes] = SWRFetchData(
    `${API_URL.ADMIN}/adminsAndDrivers`,
  );

  const today = new Date();
  const todayString = YYYYMMDDFormat(today);
  const { date, SelectDate } = useSelectDate(
    defaultValue?.date ? defaultValue?.date : todayString,
    true,
  );

  // const fetchAdminsAndDrivers = async () => {
  //   const users: any = await getAdminsAndDrivers(showNotification);
  //   setAdminsAndDrivers(users);
  // };

  // useEffect(() => {
  //   if (open) {
  //     fetchAdminsAndDrivers();
  //   }
  // }, [open]);

  useEffect(() => {
    if (adminsAndDriversRes) {
      setAdminsAndDrivers(adminsAndDriversRes?.data);
    }
  }, [adminsAndDriversRes]);

  useEffect(() => {
    setNewExpense({
      ...newExpense,
      amount: newExpense.subTotal + newExpense.GST + newExpense.PST,
    });
  }, [newExpense.PST, newExpense.GST, newExpense.subTotal]);

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
          subTotal: newExpense.subTotal,
          GST: newExpense.GST,
          PST: newExpense.PST,
          status: newExpense.status,
          codBoardId,
        });
      } else {
        response = await axios.post(`${API_URL.ADMIN}/expenses`, {
          date,
          createdAt,
          spentBy: newExpense.spentBy,
          amount: newExpense.amount,
          subTotal: newExpense.subTotal,
          GST: newExpense.GST,
          PST: newExpense.PST,
          description: newExpense.description,
          paymentMethodId: newExpense.paymentMethodId,
          status: newExpense.status,
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
      <BoxModal maxHeight={'80vh'} overflow={'auto'}>
        <ModalHead
          heading="Add Expense"
          onClose={onClose}
          onClick={() => {}}
          buttonProps={{
            loading: isAdding,
          }}
          buttonLabel="ADD"
          onlyHeading
        />

        <Tabs
          sx={{ borderBottom: 1, borderColor: 'divider', my: 2 }}
          variant="fullWidth"
          value={currentTabIndex}
          onChange={(e, index) => setCurrentTabIndex(index)}
        >
          <Tab label="Stock Purchased" value={0} />
          <Tab label="Other Expenses" value={1} />
        </Tabs>

        {currentTabIndex === 0 ? (
          <StockPurchased
            showNotification={showNotification}
            adminsAndDrivers={adminsAndDrivers}
            paymentMethods={paymentMethods?.data || []}
            codBoardId={codBoardId}
            role={USER_ROLE.ADMIN}
            // fetchAdminAndDrivers={fetchAdminsAndDrivers}
          />
        ) : (
          <OtherExpense
            codBoardId={codBoardId}
            adminsAndDrivers={adminsAndDrivers}
            paymentMethods={paymentMethods?.data || []}
            SelectDate={SelectDate}
            onChangeNewExpense={onChangeNewExpense}
            newExpense={newExpense}
            handleAddExpense={handleAddExpense}
          />
        )}
      </BoxModal>
    </Modal>
  );
}
