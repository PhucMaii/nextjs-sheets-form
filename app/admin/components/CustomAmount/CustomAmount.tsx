import { API_URL } from '@/app/utils/enum';
import { ICustomAmount } from '@/app/utils/type';
import { LoadingButton } from '@mui/lab';
import { AlertColor, Box, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
  onClose: () => void;
  // onAddCustomAmount?: any;
  onUpdateUI?: any;
  setItemList?: any;
  orderId?: number;
}

export default function CustomAmount({
  showNotification,
  onClose,
  // onAddCustomAmount,
  onUpdateUI,
  setItemList,
  orderId,
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<ICustomAmount>({
    name: '',
    price: 0,
    quantity: 1,
    cost: 0,
    isCustomAmount: true,
  });

  const onAddCustomAmountDB = async () => {
    if (!orderId) {
      showNotification('error', 'Please select an order');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL.ADMIN}/custom-amount`, {
        orderId,
        customAmount,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (onUpdateUI) {
        onUpdateUI(response.data.data);
      }
      //   setItems((prevState: any) => {
      //     return [...prevState, response.data.data];
      //   });
      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
      setIsLoading(false);
    }
  };

  const addCustomAmount = async () => {
    try {
      if (!customAmount.name) {
        showNotification('error', 'Please fill all the fields');
        return;
      }

      // if (onAddCustomAmount) {
      //   setIsLoading(true);
      //   await onAddCustomAmount(customAmount);
      //   setIsLoading(false);
      //   onClose();
      //   return;
      // }

      if (setItemList) {
        setItemList((prevState: any) => [
          ...prevState,
          {
            id: 0,
            name: customAmount.name,
            quantity: customAmount.quantity,
            price: customAmount.price,
            totalPrice: customAmount.price,
            cost: customAmount.cost,
            availability: true,
            isCustomAmount: true,
          },
        ]);
        onClose();
        return;
      }

      await onAddCustomAmountDB();
      onClose();
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      showNotification('error', error?.response?.data?.error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography>Cost</Typography>
            <TextField
              label="Cost"
              type="number"
              value={customAmount.cost}
              onChange={(e: any) =>
                setCustomAmount((prevState: any) => ({
                  ...prevState,
                  cost: +e.target.value,
                }))
              }
              placeholder="Enter price"
              fullWidth
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography>Price</Typography>
            <TextField
              label="Price"
              type="number"
              value={customAmount.price}
              onChange={(e: any) =>
                setCustomAmount((prevState: any) => ({
                  ...prevState,
                  price: +e.target.value,
                }))
              }
              placeholder="Enter price"
              fullWidth
            />
          </Box>
        </Grid>
      </Grid>

      <Typography>Name</Typography>
      <TextField
        label="Name"
        value={customAmount.name}
        onChange={(e: any) =>
          setCustomAmount((prevState: any) => ({
            ...prevState,
            name: e.target.value,
          }))
        }
        placeholder="Enter name"
        fullWidth
      />

      <Typography>Quantity</Typography>
      <TextField
        label="Quantity"
        type="number"
        value={customAmount.quantity}
        onChange={(e: any) =>
          setCustomAmount((prevState: any) => ({
            ...prevState,
            quantity: +e.target.value,
          }))
        }
        placeholder="Enter quantity"
        fullWidth
      />

      <LoadingButton
        loading={isLoading}
        variant="contained"
        onClick={addCustomAmount}
      >
        Add Custom Amount
      </LoadingButton>
    </Box>
  );
}
