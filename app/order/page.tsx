'use client';
import React, { MouseEvent, useEffect, useState } from 'react';
import { Notification } from '@/app/utils/type';
import Button from '@/app/components/Button';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Snackbar from '@/app/components/Snackbar/SnackbarPopup';
import Input from '@/app/components/Input';
import FadeIn from '@/app/HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Box, useMediaQuery } from '@mui/material';
import { YYYYMMDDFormat, formatDateChanged } from '@/app/utils/time';
import { grey } from '@mui/material/colors';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';
import moment from 'moment';
import { limitOrderHour } from '../lib/constant';
import OverrideOrder from '../components/Modals/OverrideOrder';
import { Order } from '../admin/orders/page';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar';
import useSWR from 'swr';

export default function OrderForm() {
  const [itemList, setItemList] = useState<any>([]);
  const [clientName, setClientName] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(() => {
    // format initial date
    const dateObj = new Date();
    // if current hour is greater limit hour, then recommend the next day
    if (dateObj.getHours() >= limitOrderHour) {
      dateObj.setDate(dateObj.getDate() + 1);
    }
    const formattedDate = YYYYMMDDFormat(dateObj);
    return formattedDate;
  });
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [note, setNote] = useState<string>('');
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isOpenSecurityModal, setIsOpenSecurityModal] =
    useState<boolean>(false);
  const [isOverrideOrderOpen, setIsOverrideOrderOpen] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  const { data: items, isValidating } = useSWR(API_URL.CLIENT_ITEM);

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

  const handleSubmit = async (e: MouseEvent) => {
    e.preventDefault();
    const checkUserHasInput = handleCheckUserHasInput();
    if (!checkUserHasInput) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please enter your order',
      });
      return;
    }

    try {
      setIsButtonLoading(true);
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

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      if (response.data.warning) {
        setNotification({
          on: true,
          type: 'warning',
          message: response.data.warning,
        });
        setLastOrder(response.data.data);
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
          <LoadingComponent color="blue" />
        </div>
      </Sidebar>
    );
  }

  return (
    <FadeIn>
      <Sidebar>
        {/* <AuthenGuard> */}
        <Snackbar
          open={notification.on}
          onClose={() => setNotification({ ...notification, on: false })}
          type={notification.type}
          message={notification.message}
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
            setNotification={setNotification}
          />
        )}
        <div className="bg-white w-full mx-auto pb-6">
          {smDown && <Navbar />}
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h4 className="text-center font-bold text-4xl px-8 mb-8">
              {clientName}
            </h4>
            <Box mb={4}>
              <label className="block text-red-700 text-sm font-bold mb-2">
                DELIVERY DATE
              </label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  disablePast
                  minDate={minDate}
                  value={dayjs(deliveryDate)}
                  onChange={handleDateChange}
                  sx={{
                    width: '100%',
                    height: '0.1%',
                    border: `1px solid ${grey[600]}`,
                    borderRadius: 2,
                  }}
                />
              </LocalizationProvider>
            </Box>
            {itemList.length > 0 &&
              itemList.map((item: any, index: number) => {
                return (
                  <Input<string | number>
                    key={index}
                    label={`${item.name} - $${
                      item.price === 0
                        ? ' Variable price'
                        : item.price.toFixed(2)
                    }`}
                    type="number"
                    value={item.quantity}
                    className="border-neutral-400 h-full mb-4"
                    onChange={(e) => handleChangeItem(e, item)}
                    placeholder={`Enter ${item.name} here...`}
                  />
                );
              })}
            <Input<string>
              label="NOTE"
              multiline
              value={note}
              className="border-neutral-400 h-full mb-4"
              onChange={(e) => setNote(e.target.value)}
              placeholder="Writing your note here..."
            />
            <Button
              color="blue"
              label="Submit"
              onClick={handleSubmit}
              width="full"
              loadingButton
              isLoading={isButtonLoading}
            />
          </form>
        </div>
        {/* </AuthenGuard> */}
      </Sidebar>
    </FadeIn>
  );
}
