/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { ModalProps } from './type';
import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from './styled';
import { LoadingButton } from '@mui/lab';
import { Item, Notification, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../ErrorComponent';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { OrderedItems } from '@prisma/client';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { YYYYMMDDFormat, formatDateChanged } from '@/app/utils/time';
import { limitOrderHour } from '../../../lib/constant';
import moment from 'moment';
import { infoColor } from '@/app/theme/color';
import LoadingButtonStyles from '@/app/components/LoadingButtonStyles';

interface PropTypes extends ModalProps {
  clientList: UserType[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  currentDate: string;
}

export default function AddOrder({
  open,
  onClose,
  clientList,
  setNotification,
  currentDate
}: PropTypes) {
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(currentDate);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [itemList, setItemList] = useState<Item[]>([]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (clientValue) {
      fetchClientItems();
    } else {
      setItemList([]);
    }
  }, [clientValue]);

  const copyLastOrder = async () => {
    try {
      setIsButtonLoading(true);
      const response = await axios.get(
        `${API_URL.CLIENTS}/orders?userId=${clientValue?.id}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsButtonLoading(false);
        return;
      }

      const lastOrder = response.data.data[0];

      const newItemList = itemList.map((item: Item) => {
        const targetItem = lastOrder.items.find((targetItem: OrderedItems) => {
          return targetItem.name === item.name;
        });

        if (targetItem) {
          return { ...item, quantity: targetItem.quantity };
        }
        return item;
      });

      setItemList(newItemList);
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log('Fail to copy from last order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to copy from last order: ' + error,
      });
      setIsButtonLoading(false);
    }
  };

  const fetchClientItems = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(
        `${API_URL.CLIENTS}/items?categoryId=${clientValue?.categoryId}`,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsFetching(false);
        return;
      }

      const quantitySetUp = response.data.data.map((item: Item) => {
        return { ...item, quantity: 0 };
      });

      setItemList(quantitySetUp);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client items: ', error);
      setIsFetching(false);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to copy from last order: ' + error,
      });
    }
  };

  const handleChangeItem = (e: any, targetItem: any) => {
    const newItems = itemList.map((item: any) => {
      if (item.id === targetItem.id) {
        return { ...targetItem, quantity: +e.target.value };
      }
      return item;
    });

    setItemList(newItems);
  };

  const handleDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDeliveryDate(formattedDate);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsButtonLoading(true);
    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      // Format data to have the same structure as backend
      let submittedData: any = {
        ['DELIVERY DATE']: deliveryDate,
        ['NOTE']: note,
        orderTime: `${timeString} ${dateString}`,
      };

      for (const item of itemList) {
        submittedData = { ...submittedData, [item.name]: item.quantity };
      }

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${clientValue?.id}`,
        submittedData,
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsButtonLoading(false);
        return;
      }

      if (response.data.warning) {
        setNotification({
          on: true,
          type: 'warning',
          message: response.data.warning,
        });
        setIsButtonLoading(false);
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsButtonLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        sx={{ width: '600px' }}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Add Order</Typography>
          <LoadingButtonStyles
            variant="contained"
            disabled={itemList.length === 0}
            loading={isButtonLoading}
            onClick={handleSubmit}
            color={infoColor}
          >
            ADD
          </LoadingButtonStyles>
        </Box>
        <Divider />
        <Box overflow="auto" maxHeight="70vh">
          <Grid
            container
            alignItems="center"
            columnSpacing={2}
            rowGap={2}
            mt={2}
          >
            <Grid item xs={12}>
              Client Name
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                options={clientList as UserType[]}
                getOptionLabel={(option) =>
                  `${option.clientName} - ${option.clientId}`
                }
                renderInput={(params) => (
                  <TextField {...params} label="Client" />
                )}
                value={clientValue}
                onChange={(e, newValue) => {
                  e.stopPropagation();
                  setClientValue(newValue);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider textAlign="center">Items</Divider>
            </Grid>
            <Grid item xs={12} textAlign="right">
              <LoadingButton
                onClick={copyLastOrder}
                loading={isButtonLoading}
                disabled={itemList.length === 0}
              >
                <Box display="flex" gap={1}>
                  <ContentCopyIcon />
                  <Typography variant="subtitle1">Copy last order</Typography>
                </Box>
              </LoadingButton>
            </Grid>
            <Grid item xs={6}>
              DELIVERY DATE
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dayjs(deliveryDate)}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              NOTE
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                type="text"
                inputProps={{ min: 0 }}
              />
            </Grid>
            {isFetching ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{ width: '100%' }}
              >
                <LoadingComponent color="blue" />
              </Box>
            ) : itemList.length === 0 ? (
              <ErrorComponent errorText="User Has No Items" />
            ) : (
              itemList.map((item: Item, index: number) => {
                return (
                  <Fragment key={index}>
                    <Grid item xs={6}>
                      {item.name} - ${item.price.toFixed(2)}
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(e, item)}
                        type="number"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  </Fragment>
                );
              })
            )}
          </Grid>
        </Box>
      </BoxModal>
    </Modal>
  );
}
