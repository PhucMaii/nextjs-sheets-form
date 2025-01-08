'use client';
import React, { MouseEvent, useEffect, useState } from 'react';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import FadeIn from '@/HOC/FadeIn';
import axios from 'axios';
import { API_URL, FLAG_ORDER_TYPE, USER_ROLE } from '@/app/utils/enum';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  disableChristmasAndNewYear,
  formatDateChanged,
  generateRecommendDate,
} from '@/app/utils/time';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';
import moment from 'moment';
import { limitOrderHour } from '../lib/constant';
import OverrideOrder from '../components/Modals/OverrideOrder';
import { Order } from '../admin/orders/page';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useSWR from 'swr';
import NotificationPopup from '../admin/components/Notification';
import { LoadingButton } from '@mui/lab';
import OrderOnVacationModal from '../admin/components/Modals/OrderOnVacationModal';
import useNotification from '@/hooks/useNotification';
import SearchItem from '../components/Modals/SearchItem';
import SearchIcon from '@mui/icons-material/Search';
import SellingItemName from '../components/SellingItemName';

export default function OrderForm() {
  const [itemList, setItemList] = useState<any>([]);
  const [clientName, setClientName] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(() =>
    generateRecommendDate(),
  );
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [note, setNote] = useState<string>('');
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isOpenSecurityModal, setIsOpenSecurityModal] =
    useState<boolean>(false);
  const [isOpenSearch, setIsOpenSearch] = useState<boolean>(false);
  const [isOverrideOrderOpen, setIsOverrideOrderOpen] =
    useState<boolean>(false);
  const [isOrderOnVacationOpen, setIsOrderOnVacationOpen] =
    useState<boolean>(false);
  const [unavailableRange, setUnavailableRange] = useState<Date[] | null>(null);

  const { showNotification, notification, closeNotification } =
    useNotification();
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  console.log(minDate, 'min date');
  const { data: items, isValidating } = useSWR(API_URL.CLIENT_ITEM);

  useEffect(() => {
    if (unavailableRange) {
      setIsOrderOnVacationOpen(true);
    }
  }, [unavailableRange]);

  useEffect(() => {
    if (items) {
      initializeItems();
    }
  }, [items]);

  useEffect(() => {
    if (lastOrder) {
      setIsOverrideOrderOpen(true);
    }
  }, [lastOrder]);

  // Get list of items to render input field
  const initializeItems = () => {
    const formatItems = items.data.items.map((item: any) => {
      return { ...item, quantity: 0 };
    });

    setItemList(formatItems);
    setClientName(items.data.clientName);
  };

  const handleCheckUserHasInput = () => {
    return itemList.some((item: any) => {
      return item.quantity > 0;
    });
  };

  const handleSubmit = async (
    e: MouseEvent,
    isCheckUnavailableRange: boolean = true,
  ) => {
    e.preventDefault();
    const checkUserHasInput = handleCheckUserHasInput();
    if (!checkUserHasInput) {
      showNotification('error', 'Please enter your order');
      return;
    }

    // Check is delivery date valid
    const deliveryDateObj = dayjs(deliveryDate);
    console.log(deliveryDateObj.month(), 'DELIVERY DATE OBJ');
    if (
      deliveryDateObj.isBefore(minDate) ||
      (deliveryDateObj.date() === 1 && deliveryDateObj.month() === 0)
    ) {
      showNotification('error', 'Delivery date is not valid');
      return;
    }

    try {
      setIsButtonLoading(true);
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate,
        note,
        createdAt: `${timeString} ${dateString}`,
        isCheckUnavailableRange,
        items: itemList,
        createdBy: USER_ROLE.CLIENT,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      if (response.data.warning) {
        showNotification('warning', response.data.warning);

        if (response.data.flag === FLAG_ORDER_TYPE.ALREADY_ORDER) {
          setLastOrder(response.data.data);
        } else {
          setUnavailableRange(response.data.data.unavailableRange);
        }
        setIsButtonLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsButtonLoading(false);
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.response.data.error);
      setIsButtonLoading(false);
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

  if (isValidating) {
    return (
      <Sidebar>
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <LoadingComponent />
        </div>
      </Sidebar>
    );
  }

  return (
    <FadeIn>
      <Sidebar>
        <SearchItem
          open={isOpenSearch}
          onClose={() => setIsOpenSearch(false)}
          items={itemList}
          setItems={setItemList}
        />
        <NotificationPopup
          notification={notification}
          onClose={closeNotification}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        />
        <ChangePasswordModal
          isOpen={isOpenSecurityModal}
          onClose={() => setIsOpenSecurityModal(false)}
        />
        {lastOrder && (
          <OverrideOrder
            open={isOverrideOrderOpen}
            onClose={() => setIsOverrideOrderOpen(false)}
            currentItems={itemList}
            currentNote={note}
            lastOrder={lastOrder}
            deliveryDate={deliveryDate}
            showNotification={showNotification}
          />
        )}
        {unavailableRange && (
          <OrderOnVacationModal
            clientName={clientName}
            open={isOrderOnVacationOpen}
            onClose={() => setIsOrderOnVacationOpen(false)}
            startDate={new Date(unavailableRange[0])}
            endDate={new Date(unavailableRange[1])}
            handleContinueOrder={(e: any) => handleSubmit(e, false)}
          />
        )}
        <div className="w-full mx-auto pb-6">
          {smDown && <Navbar />}
          {/* <form className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 overflow-scroll"> */}
          <Box
            sx={{ position: 'relative', backgroundColor: 'white' }}
            borderRadius={2}
            px={4}
            py={2}
          >
            {/* <h4 className="text-center font-bold text-4xl px-8 mb-8">
              {clientName}
            </h4> */}
            <Grid container alignItems="center" rowGap={2} mb={2}>
              <Grid item xs={2}></Grid>
              <Grid item xs={8}>
                <Typography variant="h4" textAlign="center">
                  {clientName}
                </Typography>
              </Grid>
              <Grid item xs={2} textAlign="right">
                <IconButton size="large" onClick={() => setIsOpenSearch(true)}>
                  <SearchIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
            <Box mb={4}>
              <Typography fontWeight="bold" variant="subtitle1" color="error">
                DELIVERY DATE
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  disablePast
                  minDate={minDate}
                  value={dayjs(deliveryDate)}
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                  shouldDisableDate={disableChristmasAndNewYear}
                />
              </LocalizationProvider>
            </Box>
            <Box display="flex" flexDirection="column" gap={4}>
              {itemList.length > 0 &&
                itemList.map((item: any, index: number) => {
                  return (
                    <Box
                      key={index}
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >
                      <SellingItemName item={item} />
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleChangeItem(e, item)}
                        placeholder={`Enter ${item.name} here...`}
                        disabled={!item.availability}
                        inputProps={{ min: 0 }}
                      />
                    </Box>
                  );
                })}
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="subtitle1">NOTE</Typography>
                <TextField
                  multiline
                  maxRows={4}
                  value={note}
                  className="border-neutral-400 h-full mb-4"
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Writing your note here..."
                />
              </Box>
            </Box>

            <Box display="flex" justifyContent={'center'}>
              <LoadingButton
                variant="contained"
                onClick={handleSubmit}
                type="submit"
                loading={isButtonLoading}
                fullWidth
                // sx={{ mt: 2}}
              >
                Submit
              </LoadingButton>
            </Box>
            {/* </form> */}
          </Box>
        </div>
      </Sidebar>
    </FadeIn>
  );
}
