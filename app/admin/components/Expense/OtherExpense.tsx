import { IPaymentMethod } from '@/app/utils/type';
import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import React from 'react';

interface IProps {
    paymentMethods: any;
    codBoardId?: number;
    adminsAndDrivers: string[];
    SelectDate: any;
    onChangeNewExpense: any;
    newExpense: any;
}

export default function OtherExpense({
    paymentMethods,
    codBoardId,
    adminsAndDrivers,
    SelectDate,
    onChangeNewExpense,
    newExpense,
}: IProps) {

  return (
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
        </Box>
  )
}
