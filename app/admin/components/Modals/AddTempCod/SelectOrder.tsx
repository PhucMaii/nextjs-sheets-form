import { Order } from '@/app/admin/orders/page';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import StatusText from '../../StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IProps {
  orders: Order[];
  codData: any;
  setCodData: any;
  showNotification: any;
  date: string;
  currentDate: string;
  onClose: any;
}

export default function SelectOrder({ orders, codData, setCodData, showNotification, date, currentDate, onClose }: IProps) {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [totalAdd, setTotalAdd ] = useState<number>(0);

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
  }

  return (
    <>
    <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
      <Typography variant="subtitle1">Route</Typography>
      <Autocomplete
        multiple
        options={orders}
        getOptionLabel={(option: Order) =>
          `${option.clientName} - ${option.clientId}`
        }
        disableCloseOnSelect
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item xs={1}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
              </Grid>
              <Grid item xs={2}>
                <StatusText
                  text={option.status}
                  type={
                    option.status === ORDER_STATUS.COMPLETED
                      ? 'success'
                      : option.status === ORDER_STATUS.DELIVERED
                        ? 'info'
                        : option.status === ORDER_STATUS.INCOMPLETED
                          ? 'warning'
                          : option.status === ORDER_STATUS.VOID
                            ? 'error'
                            : 'info'
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <Box>
                  <Typography>{option.clientName}</Typography>
                  <Typography>{option.clientId}</Typography>
                </Box>
              </Grid>
              <Grid item xs={5} textAlign={'right'}>
                  <Typography>Total: ${option.totalPrice.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </li>
        )}
        style={{ width: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Orders"
            placeholder="-- Choose orders --"
          />
        )}
        value={selectedOrders}
        onChange={onChangeSelectOrders}
      />
    </Box>

    <Box display="flex" justifyContent="flex-end" mt={2}>
        <Typography>Total: ${totalAdd}</Typography>
    </Box>

    <Button onClick={addTempCod} fullWidth variant="contained" sx={{mt: 2}}>Add</Button>
    </>

  );
}
