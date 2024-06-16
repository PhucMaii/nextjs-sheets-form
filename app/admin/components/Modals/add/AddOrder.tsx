/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { ModalProps } from '../type';
import {
  Autocomplete,
  Box,
  Divider,
  FormControl,
  Grid,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import { LoadingButton } from '@mui/lab';
import { IItem, Notification, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { OrderedItems } from '@prisma/client';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  YYYYMMDDFormat,
  formatDateChanged,
  generateCurrentTime,
  generateRecommendDate,
} from '@/app/utils/time';
import { limitOrderHour } from '../../../../lib/constant';
import moment from 'moment';
import { infoColor } from '@/app/theme/color';

interface PropTypes extends ModalProps {
  clientList: UserType[];
  setNotification: Dispatch<SetStateAction<Notification>>;
  currentDate?: string;
  createOrder?: (
    clientValue: UserType | null,
    deliveryDate: string,
    note: string,
    itemList: IItem[],
  ) => Promise<void>;
  createScheduledOrder?: (userId: number, items: IItem[]) => Promise<void>;
}

export default function AddOrder({
  open,
  onClose,
  clientList,
  setNotification,
  currentDate,
  createOrder,
  createScheduledOrder,
}: PropTypes) {
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    currentDate || generateRecommendDate(),
  );
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [itemList, setItemList] = useState<IItem[]>([]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (currentDate) {
      setDeliveryDate(currentDate);
    }
  }, [currentDate]);

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

      const newItemList = itemList.map((item: IItem) => {
        const targetItem = lastOrder.items.find((targetItem: OrderedItems) => {
          return targetItem.name === item.name;
        });

        if (targetItem) {
          return {
            ...item,
            quantity: targetItem.quantity,
            totalPrice: targetItem.totalPrice,
          };
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
        `${API_URL.CLIENTS}/items?categoryId=${clientValue?.categoryId}&subCategoryId=${clientValue?.subCategoryId}`,
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

      const quantitySetUp = response.data.data.map((item: IItem) => {
        return { ...item, quantity: 0, totalPrice: 0 };
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
        const totalPrice = item.price * +e.target.value;
        return { ...targetItem, quantity: +e.target.value, totalPrice };
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
      if (createOrder) {
        await createOrder(clientValue, deliveryDate, note, itemList);
      }

      if (createScheduledOrder && clientValue) {
        await createScheduledOrder(clientValue.id, itemList);
      }
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
          <LoadingButton
            variant="contained"
            disabled={itemList.length === 0}
            loading={isButtonLoading}
            onClick={handleSubmit}
          >
            ADD
          </LoadingButton>
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
            {createOrder && (
              <>
                <Grid item xs={6}>
                  DELIVERY DATE
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={dayjs(deliveryDate)}
                        onChange={handleDateChange}
                      />
                    </LocalizationProvider>
                  </FormControl>
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
              </>
            )}
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
              itemList.map((item: IItem, index: number) => {
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
