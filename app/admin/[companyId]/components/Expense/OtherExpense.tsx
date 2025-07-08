import { IPaymentMethod } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Select,
  OutlinedInput,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import SelectExpenseStatus from '../Select/SelectExpenseStatus';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { mainPaymentMethodId } from '@/app/lib/constant';

interface IProps {
  paymentMethods: any[];
  codBoardId?: number;
  adminsAndDrivers: string[];
  SelectDate: any;
  // onChangeNewExpense: any;
  newExpense: any;
  setNewExpense: any;
  handleAddExpense: any;
}

export default function OtherExpense({
  paymentMethods,
  codBoardId,
  adminsAndDrivers,
  setNewExpense,
  newExpense,
  handleAddExpense,
  SelectDate,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // if (newExpense?.subTotal || newExpense?.discount) {
      const gst =
        Math.round(
          (newExpense?.hasGST ? (newExpense?.subTotal - (newExpense?.discount || 0)) * 0.05 : 0) * 100,
        ) / 100;
      const pst =
        Math.round(
          (newExpense?.hasPST ? (newExpense?.subTotal - (newExpense?.discount || 0))  * 0.07 : 0) * 100,
        ) / 100;
      setNewExpense((prevState: any) => ({
        ...prevState,
        GST: gst,
        PST: pst,
        amount: prevState?.subTotal + gst + pst - (prevState?.discount || 0),
      }));
    // }
  }, [
    newExpense?.subTotal,
    newExpense?.hasGST,
    newExpense?.hasPST,
    newExpense?.discount,
  ]);

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

  const onChangeNewExpense = (field: string, value: any) => {
    if (field === 'paymentMethodId' && value === mainPaymentMethodId) {
      setNewExpense({
        ...newExpense,
        [field]: value,
        status: TRANSACTION_STATUS.PAID,
      });
    } else {
      if (field === 'subTotal') {
        const discountPercent = Math.round(((newExpense.discount / value) * 100) * 100) / 100;
        setNewExpense({
          ...newExpense,
          discountPercent: discountPercent,
          subTotal: value,
        });
      } else {
        setNewExpense({
          ...newExpense,
          [field]: value,
        });
      }
    }
  };

  const onChangeDiscount = (value: number, isPercent: boolean) => {
    if (isPercent) {
      const discount = Math.round(((value / 100) * newExpense.subTotal) * 100) / 100;
      setNewExpense((prevState: any) => ({
        ...prevState,
        discount: discount,
        discountPercent: value,
      }));
    } else {
      const discountPercent = Math.round(((value / newExpense.subTotal) * 100) * 100) / 100;
      setNewExpense((prevState: any) => ({
        ...prevState,
        discount: value,
        discountPercent: discountPercent || 0,
      }));
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
        <Grid
          item
          xs={12}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            sx={{ width: '100%' }}
          >
            <Typography variant="h6">Discount ($)</Typography>
            <OutlinedInput
              placeholder="Enter discount in $"
              fullWidth
              value={newExpense.discount}
              type="number"
              onChange={(e) => onChangeDiscount(+e.target.value, false)}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
            />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            gap={1}
            sx={{ width: '100%' }}
          >
            <Typography variant="h6">Discount (%)</Typography>
            <OutlinedInput
              placeholder="Enter discount in %"
              fullWidth
              value={newExpense.discountPercent}
              type="number"
              onChange={(e) => onChangeDiscount(+e.target.value, true)}
              startAdornment={
                <InputAdornment position="start">%</InputAdornment>
              }
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          {/* <Box display="flex" flexDirection="column" gap={1}> */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
          >
            <Typography variant="h6">Subtotal</Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newExpense?.hasGST || false}
                    onChange={(e) =>
                      onChangeNewExpense('hasGST', e.target.checked)
                    }
                  />
                }
                label="GST (5%)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newExpense?.hasPST || false}
                    onChange={(e) =>
                      onChangeNewExpense('hasPST', e.target.checked)
                    }
                  />
                }
                label="PST (7%)"
              />
            </Box>
          </Box>

          <TextField
            label="Subtotal"
            placeholder="Subtotal"
            fullWidth
            value={newExpense.subTotal}
            type="number"
            onChange={(e) => onChangeNewExpense('subTotal', +e.target.value)}
          />
          {/* </Box> */}
        </Grid>
        {(newExpense?.hasGST || newExpense?.hasPST) && (
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography>
                GST (5%): {newExpense?.GST?.toFixed(2) || 0}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography>
                PST (7%): {newExpense?.PST?.toFixed(2) || 0}
              </Typography>
            </Box>
          </Grid>
        )}
        {/* <Grid item md={6} xs={12}>
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
        </Grid> */}
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
