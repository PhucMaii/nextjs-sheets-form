import { IPaymentMethod } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';

interface IProps {
  paymentMethods: any[];
  codBoardId?: number;
  adminsAndDrivers: string[];
  SelectDate: any;
  onChangeNewExpense: any;
  newExpense: any;
  handleAddExpense: any;
}

export default function OtherExpense({
  paymentMethods,
  codBoardId,
  adminsAndDrivers,
  SelectDate,
  onChangeNewExpense,
  newExpense,
  handleAddExpense,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await handleAddExpense();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6">Date</Typography>
        {SelectDate}
      </Box>
      {/* <Box display="flex" flexDirection="column" gap={2}>
        <Typography variant="h6">Amount</Typography>
        <TextField
          placeholder="Enter epxense amount..."
          fullWidth
          value={newExpense.amount}
          type="number"
          onChange={(e) => onChangeNewExpense('amount', +e.target.value)}
        />
      </Box> */}
      {/* GST and PST */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Discount</Typography>
            <TextField
              placeholder="Discount"
              fullWidth
              value={newExpense.discount}
              type="number"
              onChange={(e) => onChangeNewExpense('discount', +e.target.value)}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Subtotal</Typography>
            <TextField
              label="Subtotal"
              placeholder="Subtotal"
              fullWidth
              value={newExpense.subTotal}
              type="number"
              onChange={(e) => onChangeNewExpense('subTotal', +e.target.value)}
            />
          </Box>
        </Grid>
        <Grid item md={6} xs={12}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">GST (5%)</Typography>
            <TextField
              placeholder="GST (5%)"
              fullWidth
              value={newExpense.GST}
              type="number"
              onChange={(e) => onChangeNewExpense('GST', +e.target.value)}
            />
          </Box>
        </Grid>
        <Grid item md={6} xs={12}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">PST (7%)</Typography>
            <TextField
              placeholder="PST (7%)"
              fullWidth
              value={newExpense.PST}
              type="number"
              onChange={(e) => onChangeNewExpense('PST', +e.target.value)}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="h6">Total</Typography>
            <TextField
              placeholder="Total"
              fullWidth
              value={newExpense.amount}
              type="number"
              onChange={(e) => onChangeNewExpense('amount', +e.target.value)}
            />
          </Box>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6">Description</Typography>
        <TextField
          multiline
          placeholder="Enter description..."
          fullWidth
          value={newExpense.description}
          onChange={(e) => onChangeNewExpense('description', e.target.value)}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6">Payment Method</Typography>
        {codBoardId ? (
          <Select
            value={newExpense.paymentMethodId}
            onChange={(e) =>
              onChangeNewExpense('paymentMethodId', +e.target.value)
            }
            size="small"
          >
            <MenuItem value={4} disabled>
              {paymentMethods[0]?.name}
            </MenuItem>
          </Select>
        ) : (
          <Select
            value={newExpense.paymentMethodId}
            onChange={(e) =>
              onChangeNewExpense('paymentMethodId', +e.target.value)
            }
            size="small"
          >
            <MenuItem value={-1} disabled>
              -- Choose payment method --
            </MenuItem>
            {paymentMethods &&
              paymentMethods?.length > 0 &&
              paymentMethods.map(
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
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6">Spent By</Typography>
        <Select
          value={newExpense.spentBy}
          onChange={(e) => onChangeNewExpense('spentBy', e.target.value)}
          size="small"
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

      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6">Status</Typography>
        <SelectExpenseStatus
          value={newExpense.status}
          onChange={(e: any) => onChangeNewExpense('status', e.target.value)}
        />
      </Box>

      <LoadingButton
        variant="contained"
        onClick={handleSubmit}
        loading={isLoading}
        fullWidth
      >
        Submit
      </LoadingButton>
    </Box>
  );
}
