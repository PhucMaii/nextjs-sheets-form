import SingleFieldEdit from '@/app/admin/components/Modals/edit/SingleFieldEdit';
import { otherPaymentMethodId } from '@/app/lib/constant';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, TRANSACTION_STATUS } from '@/app/utils/enum';
import { IExpense } from '@/app/utils/type';
import axios from 'axios';
import { useCallback, useState } from 'react';
import {
  AlertColor,
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AddIcon from '@mui/icons-material/Add';
import { errorColor, primaryColor, successColor } from '@/theme/color';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DropdownItemContainer } from '@/app/admin/orders/styled';
import AddExpense from '@/app/admin/components/Modals/add/AddExpense';

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
  const [actionButtonAnchor, setActionButtonAnchor] =
    useState<null | HTMLElement>(null);
  const openDropdown = Boolean(actionButtonAnchor);
  const [isOpenAddExpense, setIsOpenAddExpense] = useState<boolean>(false);

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

  const handleBulkUpdateStatus = useCallback(
    async (
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
    },
    [selectedExpenses, showNotification],
  );

  const UpdateExpenseStatusComp = (
    <SingleFieldEdit
      title="Select Payment Method"
      open={selectPaymentMethod.isOpenModal}
      onClose={() =>
        setSelectPaymentMethod((prevState: any) => ({
          ...prevState,
          isOpenModal: false,
        }))
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

  const Actions = (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
      <Button
        variant="outlined"
        aria-controls={openDropdown ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={openDropdown ? 'true' : undefined}
        onClick={(e) => setActionButtonAnchor(e.currentTarget)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <ArrowDownwardIcon fontSize="small" />
          <Typography fontWeight="medium">Actions</Typography>
        </Box>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={actionButtonAnchor}
        open={openDropdown}
        onClose={() => setActionButtonAnchor(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setIsOpenAddExpense(true);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <AddIcon sx={{ color: primaryColor }} />
            <Typography>Add Expense</Typography>
          </DropdownItemContainer>
        </MenuItem>

        <MenuItem
          disabled={selectedExpenses.length === 0}
          onClick={() => {
            handleBulkUpdateStatus(TRANSACTION_STATUS.PAID);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CheckIcon sx={{ color: successColor }} />
            <Typography>Mark as Paid</Typography>
          </DropdownItemContainer>
        </MenuItem>

        <MenuItem
          disabled={selectedExpenses.length === 0}
          onClick={() => {
            handleBulkUpdateStatus(TRANSACTION_STATUS.UNPAID);
          }}
        >
          <DropdownItemContainer display="flex" gap={2}>
            <CloseIcon sx={{ color: errorColor }} />
            <Typography>Mark as Unpaid</Typography>
          </DropdownItemContainer>
        </MenuItem>
      </Menu>
    </Box>
  );

  const AddExpenseModal = (
    <AddExpense
      open={isOpenAddExpense}
      onClose={() => setIsOpenAddExpense(false)}
      showNotification={showNotification}
    />
  );

  return {
    handleUpdateStatus,
    handleBulkUpdateStatus,
    UpdateExpenseStatusComp,
    isUpdating,
    Actions,
    AddExpenseModal,
  };
};
