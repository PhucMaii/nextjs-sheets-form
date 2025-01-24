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
  AlertColor,
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { BoxModal } from '../styled';
import { IItem, UserType } from '@/app/utils/type';
import axios from 'axios';
import { API_URL, FLAG_ORDER_TYPE, USER_CATEGORIZED, USER_ROLE } from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateRecommendDate,
} from '@/app/utils/time';
import OrderOnVacationModal from '../OrderOnVacationModal';
import ModalHead from '@/app/lib/ModalHead';
import moment from 'moment';
import ConfirmModal from '../ConfirmModal';
import { grey } from '@mui/material/colors';
import SellingItemName from '@/app/components/SellingItemName';
import AddCustomAmount from './AddCustomAmount';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import order from '@/pages/api/order';

interface PropTypes extends ModalProps {
  clientList: UserType[];
  showNotification: (type: AlertColor, message: string) => void;
  currentDate?: string;
  createScheduledOrder?: (userId: number, items: IItem[]) => Promise<void>;
}

export default function AddOrder({
  open,
  onClose,
  clientList,
  showNotification,
  currentDate,
  createScheduledOrder,
}: PropTypes) {
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    currentDate || generateRecommendDate(),
  );
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isOrderOnVacationOpen, setIsOrderOnVacationOpen] =
    useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  const [isOpenAddCustomAmount, setIsOpenAddCustomAmount] =
    useState<boolean>(false);

  const [itemList, setItemList] = useState<IItem[]>([]);
  const [note, setNote] = useState<string>('');
  const [unavailableRange, setUnavailableRange] = useState<Date[] | null>(null);

  useEffect(() => {
    if (unavailableRange) {
      setIsOrderOnVacationOpen(true);
    }
  }, [unavailableRange]);

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

  const addOrder = async (
    clientValue: UserType | null,
    deliveryDate: string,
    note: string,
    itemList: any,
    isCheckUnavailableRange: boolean = true,
    isForceOrder: boolean = false,
  ) => {
    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      // Format data to have the same structure as backend
      const submittedData: any = {
        // ['DELIVERY DATE']: deliveryDate,
        // ['NOTE']: note,
        deliveryDate,
        note,
        createdAt: `${timeString} ${dateString}`,
        isCheckUnavailableRange,
        items: itemList,
        createdBy: USER_ROLE.ADMIN,
        isForceOrder,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${clientValue?.id}`,
        submittedData,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (response.data.warning) {
        if (response.data.flag === FLAG_ORDER_TYPE.ALREADY_ORDER) {
          // showNotification('warning', response.data.warning);
          setIsOpenConfirmModal(true);
          return;
        } else {
          return response;
        }
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log(error);
      showNotification(
        'error',
        'There was an error creating order: ' + error.response.data.error,
      );
      return;
    }
  };

  // const copyLastOrder = async () => {
  //   try {
  //     setIsButtonLoading(true);
  //     const response = await axios.get(
  //       `${API_URL.CLIENTS}/orders?userId=${clientValue?.id}`,
  //     );

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       setIsButtonLoading(false);
  //       return;
  //     }

  //     const lastOrder = response.data.data[0];

  //     const newItemList = itemList.map((item: IItem) => {
  //       const targetItem = lastOrder.items.find((targetItem: OrderedItems) => {
  //         return targetItem.name === item.name;
  //       });

  //       if (targetItem) {
  //         return {
  //           ...item,
  //           quantity: targetItem.quantity,
  //           totalPrice: targetItem.totalPrice,
  //         };
  //       }
  //       return item;
  //     });

  //     setItemList(newItemList);
  //     setIsButtonLoading(false);
  //   } catch (error: any) {
  //     console.log('Fail to copy from last order: ', error);
  //     showNotification('error', 'Fail to copy from last order: ' + error);
  //     setIsButtonLoading(false);
  //   }
  // };

  const fetchClientItems = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(
        `${API_URL.CLIENTS}/items?categoryId=${clientValue?.categoryId}`,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsFetching(false);
        return;
      }

      const quantitySetUp = response.data.data.map((item: IItem) => {
        return {
          ...item,
          quantity: 0,
          totalPrice: 0,
        };
      });

      setItemList(quantitySetUp);
      setIsFetching(false);
    } catch (error: any) {
      console.log('Fail to fetch client items: ', error);
      setIsFetching(false);
      showNotification('error', 'Fail to copy from last order: ' + error);
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
      if (createScheduledOrder && clientValue) {
        await createScheduledOrder(clientValue.id, itemList);
        setIsButtonLoading(false);
        return;
      }

      const response: any = await addOrder(
        clientValue,
        deliveryDate,
        note,
        itemList,
      );
      if (response && response.data.warning) {
        setUnavailableRange(response.data.data.unavailableRange);
      }
      setIsButtonLoading(false);
      return;
    } catch (error: any) {
      console.log(error);
      showNotification(
        'error',
        'There was an error: ' + error.response.data.error,
      );
      setIsButtonLoading(false);
    }
  };

  const removeItemFromItemList = (item: any) => {
    const newItems = itemList.filter((i: any) => i.name !== item.name);
    setItemList(newItems);
  };

  return (
    <>
      <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        setItemList={setItemList}
        showNotification={showNotification}
      />
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        handleSubmit={() =>
          addOrder(clientValue, deliveryDate, note, itemList, true, true)
        }
        title="This client already order for selected date, are you sure to create new order?"
        showNotification={showNotification}
      />
      {unavailableRange && (
        <OrderOnVacationModal
          open={isOrderOnVacationOpen}
          onClose={() => setIsOrderOnVacationOpen(false)}
          clientName={clientValue?.clientName || ''}
          startDate={new Date(unavailableRange[0])}
          endDate={new Date(unavailableRange[1])}
          handleContinueOrder={async () =>
            await addOrder(clientValue, deliveryDate, note, itemList, false)
          }
        />
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          sx={{ width: '600px' }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModalHead
            heading="Add Order"
            buttonLabel="Add"
            buttonProps={{ loading: isButtonLoading }}
            onClick={handleSubmit}
            onClose={onClose}
          />
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
                  getOptionDisabled={(client: UserType) => {
                    return client?.type === USER_CATEGORIZED.INACTIVE
                  }}
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
              {!createScheduledOrder && (
                <>
                  <Grid item xs={12} textAlign="right">
                    <Button onClick={() => setIsOpenAddCustomAmount(true)}>
                      + Custom Amount
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    DELIVERY DATE
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          value={dayjs(deliveryDate)}
                          onChange={handleDateChange}
                          shouldDisableDate={disableChristmasAndNewYear}
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
                  <LoadingComponent />
                </Box>
              ) : itemList.length === 0 ? (
                <ErrorComponent errorText="User Has No Items" />
              ) : (
                itemList.map((item: IItem, index: number) => {
                  return (
                    <Fragment key={index}>
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <SellingItemName item={item} />
                          {item?.id < 1 && (
                            <IconButton
                              onClick={() => removeItemFromItemList(item)}
                              color="error"
                            >
                              <RemoveCircleIcon color="error" />
                            </IconButton>
                          )}
                        </Box>
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
    </>
  );
}
