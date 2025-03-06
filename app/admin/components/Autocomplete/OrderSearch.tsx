import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect } from 'react';
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

const OrderSearch = ({
  orders,
  selectedOrders,
  onChangeSelectOrders,
}: IProps) => {
  const [cacheOrders, setCacheOrders] = React.useState<Order[]>([]);

  useEffect(() => {
    setCacheOrders(orders || orders?.deliveryOrders || []);
    console.log(orders, 'orders in search orders');
  }, [orders]);
  // const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const filterOptions = (
    options: Order[],
    { inputValue }: { inputValue: string },
  ) => {
    if (!inputValue.trim()) return options;
    const keywords = inputValue.toLowerCase();

    const res = options.filter((option: Order) => {
      return (
        option.clientName.toLowerCase().includes(keywords) ||
        option.clientId.toLowerCase().includes(keywords) ||
        option.deliveryDate.toLowerCase().includes(keywords)
      );
    });
    return res;
  };

  console.log(orders,' orders in order search')
  return (
    <Autocomplete
      multiple
      disabled={!cacheOrders.length || cacheOrders.length === 0}
      aria-disabled={!cacheOrders.length || cacheOrders.length === 0}
      options={cacheOrders || []}
      getOptionLabel={(option: Order) =>
        `${option.id} - ${option.clientName} - ${option.clientId}`
      }
      filterOptions={filterOptions}
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
          disabled={!cacheOrders.length || cacheOrders.length === 0}
          aria-disabled={!cacheOrders.length || cacheOrders.length === 0}
        />
      )}
      value={selectedOrders}
      onChange={onChangeSelectOrders}
    />
  );
}

export default memo(OrderSearch, (prev, next) => {
  return (
    Object.is(prev.orders, next.orders) &&
    Object.is(prev.selectedOrders, next.selectedOrders)
  );
})