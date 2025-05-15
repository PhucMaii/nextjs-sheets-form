'use client';
import React, { useState } from 'react';
import {
  AlertColor,
  Autocomplete,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { UserType } from '@/app/utils/type';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { SWRFetchData } from '@/app/utils/db';
import useSelectDate from '@/hooks/useSelectDate';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { Order } from '@/app/admin/[companyId]/orders/page';

interface IProps {
  showNotification: (type: AlertColor, message: string) => void;
}

export default function PlaceOrder({ showNotification }: IProps) {
  // const [itemList, setItemList] = useState<OrderedItems[] | any>([]);
  const [selectedClient, setSelectedClient] = useState<UserType | null>(null);

  const { date: deliveryDate } = useSelectDate('', true);

  // Data Fetching
  const [clientList] = SWRFetchData(`${API_URL.DRIVER}/clients`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, mutateItems] = SWRFetchData(
    `/api/item?userId=${selectedClient?.id}`,
  );

  // useEffect(() => {
  //   if (items) {
  //     initializeItems();
  //   }
  // }, [items]);

  const addOrder = async (order: Order) => {
    // const isInputValid = handleCheckUserHasInput();
    // if (!isInputValid) {
    //   showNotification('error', 'Please Enter Quantity for Items');
    //   return;
    // }
    try {
      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        items: order.items,
        createdBy: USER_ROLE.DRIVER,
      };

      const response = await axios.post(
        `${API_URL.IMPORT_SHEETS}?userId=${selectedClient?.id}`,
        submittedData,
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (response.data.warning) {
        showNotification('warning', response.data.warning);
        return;
      }

      showNotification(
        'success',
        `Placed Order Successfully for ${selectedClient?.clientName}`,
      );
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.response.data.error);
      return;
    }
  };

  return (
    <>
      <Typography variant="h4" textAlign="center">
        Place Order
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        gap={1}
        justifyContent="center"
      >
        <Box mb={4} display="flex" flexDirection="column" gap={1}>
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
        <OrderView
          items={items?.data?.items || []}
          purpose={ORDER_USAGE_PURPOSE.ORDER}
          onSubmit={addOrder}
          defaultDeliveryDate={deliveryDate}
          role={USER_ROLE.DRIVER}
          clientName={selectedClient?.clientName}
        />
      </Box>
    </>
  );
}
