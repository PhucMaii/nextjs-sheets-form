import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';
import { generateCurrentTime, YYYYMMDDFormat } from '@/app/utils/time';
import { IPaymentMethod } from '@/app/utils/type';
import useSelectDate from '@/hooks/useSelectDate';
import { LoadingButton } from '@mui/lab';
import { AlertColor, Box, MenuItem, Select, TextField, Typography } from '@mui/material'
import axios from 'axios';
import React, { useState } from 'react';

interface IProps {
    showNotification: (type: AlertColor, message: string) => void
}

export default function AddExpense({showNotification}: IProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newExpense, setNewExpense] = useState<any>({
        amount: 0,
        description: '',
        paymentMethodId: -1,
    })

    // Data Fetching
    const [paymentMethods] = SWRFetchData(`${API_URL.DRIVER}/paymentMethods`);

    const today = new Date();
    const todayString = YYYYMMDDFormat(today);
    const { date, SelectDate } = useSelectDate(todayString, true);

    const onChangeNewExpense = (field: string, value: any) => {
        setNewExpense({
          ...newExpense,
          [field]: value,
        });
    };

    const handleAddExpense = async () => {
        try {
          setIsAdding(true);
          const createdAt = generateCurrentTime();
    
          const response = await axios.post(`${API_URL.DRIVER}/expenses`, {
            date,
            createdAt,
            spentBy: newExpense.spentBy,
            amount: newExpense.amount,
            description: newExpense.description,
            paymentMethodId: newExpense.paymentMethodId,
          });
    
          if (response.data.error) {
            showNotification('error', response.data.error);
            setIsAdding(false);
            return;
          }
    
          showNotification('success', response.data.message);
          setIsAdding(false);
        } catch (error) {
          console.log(error);
          showNotification('error', 'Something went wrong');
          setIsAdding(false);
          return;
        }
      };

  return (
    <Box>
        <Typography variant="h4" textAlign="center">Add Expense</Typography>

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
              inputProps={{ min: 0 }}
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
            <Select
              value={newExpense.paymentMethodId}
              onChange={(e) =>
                onChangeNewExpense('paymentMethodId', +e.target.value)
              }
            >
              <MenuItem value={-1} disabled>
                -- Choose payment method --
              </MenuItem>
              {paymentMethods && paymentMethods?.data?.length > 0 &&
                paymentMethods.data.map(
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

          <LoadingButton
            disabled={newExpense.amount <= 0 || newExpense.paymentMethodId === -1 || !date}
            fullWidth
            loading={isAdding} 
            variant="contained" 
            onClick={handleAddExpense}
          >
            Submit
          </LoadingButton>
        </Box>
    </Box>
  )
}
