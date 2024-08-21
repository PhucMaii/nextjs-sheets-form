'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { limitOrderHour } from '@/app/lib/constant';
import { formatDateChanged, YYYYMMDDFormat } from '@/app/utils/time';
import { Notification, OrderedItems, UserType } from '@/app/utils/type';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import { ShadowSection } from '@/app/admin/reports/styled';
import { grey } from '@mui/material/colors';
import ErrorComponent from '@/app/admin/components/ErrorComponent';
import moment from 'moment';
import axios from 'axios';
import { LoadingButton } from '@mui/lab';
import NotificationPopup from '@/app/admin/components/Notification';
import { SWRFetchData } from '@/app/utils/db';

export default function PlaceOrder() {
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
  const [itemList, setItemList] = useState<OrderedItems[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [notification, setNotification] = useState<Notification>({
    on: false,
    type: 'info',
    message: '',
  });
  const [selectedClient, setSelectedClient] = useState<UserType | null>(null);

  // Data Fetching
  const [clientList] = SWRFetchData(`${API_URL.DRIVER}/clients`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, mutateItems] = SWRFetchData(`${API_URL.CLIENT_ITEM}?userId=${selectedClient?.id}`)

  useEffect(() => {
    if (items) {
      initializeItems();
    }
  }, [items]);

  const addOrder = async () => {
    const isInputValid = handleCheckUserHasInput();
    if (!isInputValid) {
      setNotification({
        on: true,
        type: 'error',
        message: 'Please Enter Quantity for Items',
      });
      return;
    }
    setIsSubmitting(true);
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
        `${API_URL.IMPORT_SHEETS}?userId=${selectedClient?.id}`,
        {...submittedData, createdBy: USER_ROLE.DRIVER},
      );

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      if (response.data.warning) {
        setNotification({
          on: true,
          type: 'warning',
          message: response.data.warning,
        });
        return;
      }

      setNotification({
        on: true,
        type: 'success',
        message: `Placed Order Successfully for ${selectedClient?.clientName}`,
      });

      setIsSubmitting(false);
    } catch (error: any) {
      console.log(error);
      setNotification({
        on: true,
        type: 'error',
        message: error.response.data.error,
      });
      setIsSubmitting(false);
      return;
    }
  };

  const initializeItems = () => {
    const formatItems = items.data.items.map((item: any) => {
      return { ...item, quantity: 0 };
    });

    setItemList(formatItems);
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

  const handleCheckUserHasInput = () => {
    return itemList.some((item: any) => {
      return item.quantity > 0;
    });
  };

  const handleDateChange = (e: any) => {
    const formattedDate = formatDateChanged(e);
    setDeliveryDate(formattedDate);
  };

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification({ ...notification, on: false })}
      />
      <Typography variant="h6" textAlign="center">
        Place Order
      </Typography>
      <ShadowSection
        display="flex"
        flexDirection="column"
        gap={1}
        justifyContent="center"
      >
        <Box mb={4}>
          <Typography fontWeight="bold" variant="subtitle1">
            Client
          </Typography>
          <Autocomplete
            options={clientList ? clientList.data : []}
            getOptionLabel={(option) => {
              return `${option.clientName} - ${option.clientId}`;
            }}
            renderInput={(params) => <TextField {...params} />}
            value={selectedClient}
            onChange={(e, newValue) => setSelectedClient(newValue)}
            sx={{ width: 'auto' }}
          />
        </Box>
        <Box mb={4}>
          <Typography fontWeight="bold" variant="subtitle1">
            DELIVERY DATE
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disablePast
              value={dayjs(deliveryDate)}
              onChange={handleDateChange}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Box>
        {selectedClient ? (
          <>
            {itemList.length > 0 &&
              itemList.map((item: any, index: number) => {
                return (
                  <Box
                    key={index}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                  >
                    <Typography
                      sx={{ color: item.availability ? 'black' : grey[500] }}
                      fontWeight="bold"
                      variant="subtitle1"
                    >
                      {`${item.name} - ${
                        !item.availability
                          ? 'Out of stock'
                          : item.price === 0
                            ? ' Variable price'
                            : `$${item.price.toFixed(2)}`
                      }`}
                    </Typography>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(e, item)}
                      placeholder={`Enter ${item.name} here...`}
                      disabled={!item.availability}
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
          </>
        ) : (
          <ErrorComponent errorText="Please select a client " />
        )}

        <LoadingButton
          disabled={!selectedClient}
          variant="contained"
          onClick={addOrder}
          loading={isSubmitting}
          fullWidth
          sx={{ mt: 2 }}
        >
          Submit
        </LoadingButton>
      </ShadowSection>
    </Sidebar>
  );
}
