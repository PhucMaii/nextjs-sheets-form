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
import { Order } from '@/app/admin/orders/page';

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
    `${API_URL.CLIENT_ITEM}?userId=${selectedClient?.id}`,
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

  // const initializeItems = () => {
  //   const formatItems = items.data.items.map((item: any) => {
  //     return { ...item, quantity: 0 };
  //   });

  //   setItemList(formatItems);
  // };

  // const handleChangeItem = (e: any, targetItem: any) => {
  //   const newItems = itemList.map((item: any) => {
  //     if (item.id === targetItem.id) {
  //       return { ...targetItem, quantity: +e.target.value };
  //     }
  //     return item;
  //   });

  //   setItemList(newItems);
  // };

  // const handleCheckUserHasInput = () => {
  //   return itemList.some((item: any) => {
  //     return item.quantity > 0;
  //   });
  // };

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
        />
        {/* <Box mb={4} display="flex" flexDirection="column" gap={1}>
          <Typography fontWeight="bold" variant="subtitle1">
            DELIVERY DATE
          </Typography>
          {SelectDate}
        </Box> */}
        {/* {selectedClient ? (
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
                    <SellingItemName item={item} />
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(e, item)}
                      placeholder={`Enter ${item.name} here...`}
                      disabled={!item.availability}
                    />
                  </Box>
                );
              })} */}
            {/* <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">NOTE</Typography>
              <TextField
                multiline
                maxRows={4}
                value={note}
                className="border-neutral-400 h-full mb-4"
                onChange={(e) => setNote(e.target.value)}
                placeholder="Writing your note here..."
              />
            </Box> */}
          {/* </> */}
        {/* ) : (
          <ErrorComponent errorText="Please select a client " />
        )} */}

        {/* <LoadingButton
          disabled={!selectedClient}
          variant="contained"
          onClick={addOrder}
          loading={isSubmitting}
          fullWidth
          sx={{ mt: 2 }}
        >
          Submit
        </LoadingButton> */}
      </Box>
    </>
  );
}
