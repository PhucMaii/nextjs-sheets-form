import SingleFieldEdit from '@/app/admin/components/Modals/edit/SingleFieldEdit';
import { otherPaymentMethodId } from '@/app/lib/constant';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, TRANSACTION_STATUS } from '@/app/utils/enum';
import { IExpense } from '@/app/utils/type';
import { AlertColor } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

export const useUpdateExpenseStatus = (
  showNotification: (type: AlertColor, message: string) => void,
  selectedExpenses: IExpense[] = [],
) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [selectPaymentMethod, setSelectPaymentMethod] = useState<any>({
    isOpenModal: false,
    selectedTransaction: null,
    updatedStatus: null,
    isBulk: false,
  });

  const [paymentMethods] = SWRFetchData(`${API_URL.ADMIN}/paymentMethods`);

  const handleUpdateStatus = async (
    transaction: any,
    newStatus: TRANSACTION_STATUS,
    newPaymentMethodId: any = otherPaymentMethodId,
  ) => {
    // Handle update status of OTHER payment method
    if (
      transaction.paymentMethodId === otherPaymentMethodId &&
      newPaymentMethodId === otherPaymentMethodId &&
      newStatus === TRANSACTION_STATUS.PAID
    ) {
      setSelectPaymentMethod({
        isOpenModal: true,
        selectedTransaction: transaction,
        updatedStatus: newStatus,
        isBulk: false,
      });
      showNotification('warning', 'Please choose a different method');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axios.put(`${API_URL.ADMIN}/expenses/status`, {
        id: transaction.id,
        status: newStatus,
        newPaymentMethodId,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Fail to update status: ', error);
      showNotification(
        'error',
        `Fail to update status: ${error?.respones?.data?.error}`,
      );
      setIsUpdating(false);
    }
  };

  const handleBulkUpdateStatus = async (
    newStatus: TRANSACTION_STATUS,
    newPaymentMethodId: number = otherPaymentMethodId,
  ) => {
    try {
      const idsToUpdate = selectedExpenses.map(
        (expense: IExpense) => expense.id,
      );

      if (
        newStatus === TRANSACTION_STATUS.PAID &&
        newPaymentMethodId === otherPaymentMethodId
      ) {
        const isOtherPaymentMethod = selectedExpenses.some(
          (expense: IExpense) =>
            expense.paymentMethodId === otherPaymentMethodId,
        );

        if (isOtherPaymentMethod) {
          setSelectPaymentMethod({
            isOpenModal: true,
            selectedTransaction: null,
            updatedStatus: newStatus,
            isBulk: true,
          });
          showNotification('warning', 'Please choose a different method');
          return;
        }
      }

      setIsUpdating(true);
      const response = await axios.put(`${API_URL.ADMIN}/expenses/status`, {
        idsToUpdate,
        status: newStatus,
        newPaymentMethodId,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsUpdating(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsUpdating(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification(
        'error',
        'Fail to bulk update status: ' + error.response.data.error,
      );
      setIsUpdating(false);
    }
  };

  const UpdateExpenseStatusComp = (
    <SingleFieldEdit
      title="Select Payment Method"
      open={selectPaymentMethod.isOpenModal}
      onClose={() =>
        setSelectPaymentMethod({ ...selectPaymentMethod, isOpenModal: false })
      }
      handleUpdate={(newPaymentMethod: any) => {
        if (selectPaymentMethod.isBulk) {
          handleBulkUpdateStatus(
            selectPaymentMethod.updatedStatus,
            newPaymentMethod,
          );
        } else {
          handleUpdateStatus(
            selectPaymentMethod.selectedTransaction,
            selectPaymentMethod.updatedStatus,
            newPaymentMethod,
          );
        }
      }}
      renderField="name"
      inputLabel="Payment Method"
      menuList={paymentMethods?.data || []}
      defaultValue={otherPaymentMethodId}
    />
  );

  return {
    handleUpdateStatus,
    handleBulkUpdateStatus,
    UpdateExpenseStatusComp,
    isUpdating,
  };
};
