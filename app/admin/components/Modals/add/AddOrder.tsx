/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import {
  AlertColor,
  Autocomplete,
  Box,
  Divider,
  Grid,
  Modal,
  TextField,
} from '@mui/material';
import { BoxModal } from '../styled';
import { IItem, UserType } from '@/app/utils/type';
import axios from 'axios';
import {
  API_URL,
  FLAG_ORDER_TYPE,
  USER_CATEGORIZED,
  USER_ROLE,
} from '@/app/utils/enum';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import ErrorComponent from '../../ErrorComponent';
import { formatDateChanged, generateRecommendDate } from '@/app/utils/time';
import OrderOnVacationModal from '../OrderOnVacationModal';
import ModalHead from '@/app/lib/ModalHead';
import ConfirmModal from '../ConfirmModal';
import AddCustomAmount from './AddCustomAmount';
import { SWRFetchData } from '@/app/utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { Order } from '@/app/admin/orders/page';

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
  const [cachedOrder, setCachedOrder] = useState<any | null>(null);
  const [clientValue, setClientValue] = useState<UserType | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    currentDate || generateRecommendDate(),
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isOrderOnVacationOpen, setIsOrderOnVacationOpen] =
    useState<boolean>(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false);
  const [isOpenAddCustomAmount, setIsOpenAddCustomAmount] =
    useState<boolean>(false);

  const [baseItems, setBaseItems] = useState<IItem[]>([]);

  const [clientItems, _mutate, isValidating] = SWRFetchData(
    clientValue
      ? `${API_URL.CLIENTS}/items?categoryId=${clientValue?.categoryId}`
      : '',
  );

  useEffect(() => {
    if (!clientItems && isValidating) {
      setIsFetching(true);
      setBaseItems([]);
    } else {
      setIsFetching(false);
      initializeItems();
    }
  }, [clientItems, clientValue]);

  useEffect(() => {
    if (currentDate) {
      setDeliveryDate(currentDate);
    }
  }, [currentDate]);

  const addOrder = async (
    order: Order,
    isCheckUnavailableRange: boolean = true,
    isForceOrder: boolean = false,
  ) => {
    if (!order.items || order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return;
    }
    try {
      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        isCheckUnavailableRange,
        items: order.items,
        createdBy: USER_ROLE.ADMIN,
        isForceOrder,
      };

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
          setCachedOrder(submittedData);
          setIsOpenConfirmModal(true);
          return;
        } else if (response.data.flag === FLAG_ORDER_TYPE.VACATION_ORDER) {
          setCachedOrder({
            ...submittedData,
            startDate: response.data.data.unavailableRange[0],
            endDate: response.data.data.unavailableRange[1],
          });
          setIsOrderOnVacationOpen(true);
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

  const initializeItems = () => {
    if (clientItems) {
      const quantitySetUp = clientItems.data.map((item: IItem) => {
        return {
          ...item,
          quantity: 0,
          totalPrice: 0,
        };
      });

      setBaseItems(quantitySetUp);
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

  // const handleChangeItem = (e: any, targetItem: any) => {
  //   const newBaseItems = baseItems.map((item: any) => {
  //     if (item.id === targetItem.id) {
  //       const totalPrice = item.price * +e.target.value;
  //       return { ...item, quantity: +e.target.value, totalPrice };
  //     }

  //     return item;
  //   });

  //   setBaseItems(newBaseItems);
  // };

  // const handleDateChange = (e: any) => {
  //   const formattedDate = formatDateChanged(e);
  //   setDeliveryDate(formattedDate);
  // };

  // const handleSubmit = async (e: any) => {
  //   e.preventDefault();
  //   setIsButtonLoading(true);
  //   try {
  //     if (createScheduledOrder && clientValue) {
  //       await createScheduledOrder(clientValue.id, itemList);
  //       setIsButtonLoading(false);
  //       return;
  //     }

  //     const response: any = await addOrder(
  //       clientValue,
  //       deliveryDate,
  //       note,
  //       itemList,
  //     );
  //     if (response && response.data.warning) {
  //       setUnavailableRange(response.data.data.unavailableRange);
  //     }
  //     setIsButtonLoading(false);
  //     return;
  //   } catch (error: any) {
  //     console.log(error);
  //     showNotification(
  //       'error',
  //       'There was an error: ' + error.response.data.error,
  //     );
  //     setIsButtonLoading(false);
  //   }
  // };

  // const removeItemFromItemList = (item: any) => {
  //   const newBaseItems = baseItems.filter((i: any) => i.name !== item.name);

  //   setBaseItems(newBaseItems);
  // };

  return (
    <>
      <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        setItemList={setBaseItems}
        showNotification={showNotification}
      />
      <ConfirmModal
        open={isOpenConfirmModal}
        onClose={() => setIsOpenConfirmModal(false)}
        handleSubmit={async () => await addOrder(cachedOrder, true, true)}
        title="This client already order for selected date, are you sure to create new order?"
        showNotification={showNotification}
      />
      {isOrderOnVacationOpen && (
        <OrderOnVacationModal
          open={isOrderOnVacationOpen}
          onClose={() => setIsOrderOnVacationOpen(false)}
          clientName={clientValue?.clientName || ''}
          startDate={new Date(cachedOrder.startDate)}
          endDate={new Date(cachedOrder.endDate)}
          handleContinueOrder={async () =>
            await addOrder(cachedOrder, false, true)
          }
        />
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal
          // sx={{ maxWidth: '800px' }}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModalHead
            heading="Add Order"
            buttonLabel="Add"
            buttonProps={{}}
            onClick={() => {}}
            onlyHeading
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
                    return client?.type === USER_CATEGORIZED.INACTIVE;
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
              {/* {!createScheduledOrder && (
                <>
                  <Grid item xs={12} textAlign="right">
                    <Button onClick={() => setIsOpenAddCustomAmount(true)}>
                      + Custom Amount
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    DELIVERY DATE
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={6}>
                    NOTE
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      type="text"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl variant="filled" fullWidth>
                      <InputLabel htmlFor="search">Search</InputLabel>
                      <FilledInput
                        id="search"
                        fullWidth
                        value={searchKeywords}
                        onChange={(e: any) => setSearchKeywords(e.target.value)}
                        type="text"
                        startAdornment={
                          <InputAdornment position="start">
                            <IconButton>
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                </>
              )} */}
              {isFetching ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ width: '100%' }}
                >
                  <LoadingComponent />
                </Box>
              ) : baseItems.length === 0 ? (
                <ErrorComponent errorText="User Has No Items" />
              ) : (
                <OrderView
                  items={baseItems}
                  purpose={ORDER_USAGE_PURPOSE.ORDER}
                  isModal
                  onSubmit={async (order: Order) => {
                    await addOrder(order);
                  }}
                />
                // itemList.map((item: IItem, index: number) => {
                //   return (
                //     <Fragment key={index}>
                //       <Grid item xs={12} md={6}>
                //         <Box display="flex" alignItems="center" gap={1}>
                //           <SellingItemName item={item} />
                //           {item?.id < 1 && (
                //             <IconButton
                //               onClick={() => removeItemFromItemList(item)}
                //               color="error"
                //             >
                //               <RemoveCircleIcon color="error" />
                //             </IconButton>
                //           )}
                //         </Box>
                //       </Grid>
                //       <Grid item xs={12} md={6}>
                //         <TextField
                //           fullWidth
                //           label="Quantity"
                //           value={item.quantity}
                //           onChange={(e) => handleChangeItem(e, item)}
                //           type="number"
                //           inputProps={{ min: 0 }}
                //         />
                //       </Grid>
                //     </Fragment>
                //   );
                // })
              )}
            </Grid>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
