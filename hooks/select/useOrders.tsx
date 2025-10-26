import StatusText from '@/app/admin/[companyId]/components/StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';
import {
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Orders } from '@prisma/client';
import { useState } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const useOrders = (listOfOrders: Orders[]) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const renderOrderSearch = () => {
    return (
      <Autocomplete
        options={listOfOrders}
        filterOptions={(options, state) => {
          return options.filter((option: any) => {
            return (
              option.clientName
                .toLowerCase()
                .includes(state.inputValue.toLowerCase()) ||
              option.clientId
                .toLowerCase()
                .includes(state.inputValue.toLowerCase()) ||
              option.deliveryDate
                .toLowerCase()
                .includes(state.inputValue.toLowerCase())
            );
          });
        }}
        getOptionLabel={(option: any) =>
          `${option.id} - ${option?.clientName || option?.user?.clientName} - ${option.clientId || option?.user?.clientId}`
        }
        renderOption={(props, option) => (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item xs={2} md={1}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 8 }}
                  checked={selectedOrder?.id === option.id}
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
                  <Typography>
                    {option?.clientName || option?.user?.clientName}
                  </Typography>
                  <Typography>
                    {option?.clientId || option?.user?.clientId}
                  </Typography>
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
        renderInput={(params) => <TextField {...params} label="Order" />}
        value={selectedOrder}
        onChange={(e: any, value: any) => setSelectedOrder(value)}
      />
    );
  };

  const handleSelectOrderById = (id: number) => {
    const order = listOfOrders.find((order: any) => order.id === id);
    if (order) {
      setSelectedOrder(order);
    }
  };

  return {
    selectedOrder,
    setSelectedOrder,
    renderOrderSearch,
    handleSelectOrderById,
  };
};

export default useOrders;
