'use client';
import React, { MouseEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Notification, SessionClientType } from '@/app/utils/type';
import Button from '@/app/components/Button';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import Navbar from '@/app/components/Navbar';
import Snackbar from '@/app/components/Snackbar/Snackbar';
import Input from '@/app/components/Input';
import FadeIn from '@/app/HOC/FadeIn';
import axios from 'axios';
import { API_URL } from '@/app/utils/enum';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { YYYYMMDDFormat, formatDateChanged } from '@/app/utils/time';
import { grey } from '@mui/material/colors';
import ChangePasswordModal from '../components/Modals/ChangePasswordModal';
import moment from 'moment';
import { limitOrderHour } from '../admin/lib/constant';

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
  const [note, setNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
  const [isOpenSecurityModal, setIsOpenSecurityModal] =
    useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const { status }: SessionClientType = useSession() as SessionClientType;

  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');

  useEffect(() => {
    fetchItems();
  }, []);

  // Get list of items to render input field
  const fetchItems = async () => {
    try {
      const response = await axios.get(API_URL.ITEM);

      if (response.data.error) {
        setIsLoading(false);
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
      }

      const formatItems = response.data.data.items.map((item: any) => {
        return { ...item, quantity: 0 };
      });

      setItemList(formatItems);
      setClientName(response.data.data.clientName);
      setIsLoading(false);
    } catch (error: any) {
      console.log('There was an error: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'There was an error: ' + error,
      });
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: MouseEvent) => {
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

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

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

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
        <LoadingComponent color="blue" />
      </div>
    );
  }

  return (
    <FadeIn>
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
      <Navbar handleOpenSecurityModal={() => setIsOpenSecurityModal(true)} />
      <div className="max-w-2xl mx-auto py-16">
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
                  label={item.name}
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
    </FadeIn>
  );
}
