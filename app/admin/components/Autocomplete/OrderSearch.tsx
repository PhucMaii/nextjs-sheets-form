import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { Order } from '../../orders/page';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import StatusText from '../StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IProps {
  orders: Order[] | any;
  selectedOrders: Order[];
  onChangeSelectOrders: any;
}

export default function OrderSearch({
  orders,
  selectedOrders,
  onChangeSelectOrders,
}: IProps) {
  // const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  console.log(orders.length, 'orders');
  return (
    <Autocomplete
      multiple
      disabled={!orders.length || orders.length === 0}
      aria-disabled={!orders.length || orders.length === 0}
      options={orders || orders?.deliveryOrders || []}
      getOptionLabel={(option: Order) =>
        `${option.clientName} - ${option.clientId}`
      }
      // PopperComponent={(props: any) => (
      //   <Popper
      //     {...props}
      //     placement={mdDown ? 'top-start' : 'auto'}
      //   />
      // )}
      disableCloseOnSelect
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Grid container alignItems="center">
            <Grid item xs={2} md={1}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
            </Grid>
            <Grid item xs={10} md={2}>
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
            <Grid item xs={6} md={4}>
              <Box>
                <Typography>{option.clientName}</Typography>
                <Typography>{option.clientId}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4} md={3}>
              <Typography>{option.deliveryDate}</Typography>
            </Grid>
            <Grid item xs={2} md={2} textAlign={'right'}>
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
          disabled={!orders.length || orders.length === 0}
          aria-disabled={!orders.length || orders.length === 0}
        />
      )}
      value={selectedOrders}
      onChange={onChangeSelectOrders}
    />
  );
}
