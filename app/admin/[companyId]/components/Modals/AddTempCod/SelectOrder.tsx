import { Order } from '@/app/admin/[companyId]/orders/page';
import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import OrderSearch from '../../Autocomplete/OrderSearch';

interface IProps {
  orders: Order[];
  codData: any;
  setCodData: any;
  showNotification: any;
  date: string;
  currentDate: string;
  onClose: any;
}

export default function SelectOrder({
  orders,
  codData,
  setCodData,
  showNotification,
  date,
  currentDate,
  onClose,
}: IProps) {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [totalAdd, setTotalAdd] = useState<number>(0);

  const onChangeSelectOrders = (e: any, value: Order[]) => {
    const newTotal = value.reduce((acc: number, item: Order) => {
      return acc + item.totalPrice;
    }, 0);

    setTotalAdd(newTotal);
    setSelectedOrders(value);
  };

  const addTempCod = () => {
    if (date === currentDate) {
      showNotification('error', 'Please select other date');
      return;
    }

    if (selectedOrders.length === 0 || totalAdd === 0) {
      showNotification('error', 'Please select orders');
      return;
    }

    setCodData({
      ...codData,
      uncollectedCODBill: codData.uncollectedCODBill + totalAdd,
      uncollectedCODOrders: [
        ...codData.uncollectedCODOrders,
        ...selectedOrders,
      ],
    });
    onClose();
  };

  return (
    <>
      <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
        <Typography variant="subtitle1">Route</Typography>
        <OrderSearch
          orders={orders}
          selectedOrders={selectedOrders}
          onChangeSelectOrders={onChangeSelectOrders}
        />
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Typography>Total: ${totalAdd}</Typography>
      </Box>

      <Button onClick={addTempCod} fullWidth variant="contained" sx={{ mt: 2 }}>
        Add
      </Button>
    </>
  );
}
