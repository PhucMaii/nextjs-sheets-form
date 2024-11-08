import { AlertColor, Modal, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import axios from 'axios';
import { SWRFetchData } from '@/app/utils/db';
import StockPurchased from '../../Expense/StockPurchased';
import OtherExpense from '../../Expense/OtherExpense';
import { getAdminsAndDrivers } from '@/app/utils/adminsAndDrivers';

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
    const fetchAdminsAndDrivers = async () => {
      const users: any = await getAdminsAndDrivers(showNotification);
      setAdminsAndDrivers(users);
    };

    fetchAdminsAndDrivers();
  }, []);

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
        });
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
<<<<<<< HEAD
            role={USER_ROLE.ADMIN}
=======
>>>>>>> b91c1136cde281479a436538635c5f77f3521bd7
          />
        ) : (
          <OtherExpense
            codBoardId={codBoardId}
            adminsAndDrivers={adminsAndDrivers}
            paymentMethods={paymentMethods}
            SelectDate={SelectDate}
            onChangeNewExpense={onChangeNewExpense}
            newExpense={newExpense}
            handleAddExpense={handleAddExpense}
          />
        )}

        {/* <Box display="flex" flexDirection="column" gap={3}>
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
            ) : (
              <Select
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
              </Select>
            )}
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
        </Box> */}
      </BoxModal>
    </Modal>
  );
}
