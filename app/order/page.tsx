'use client';
import React, { useEffect, useState } from 'react';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';
import { Box, Tab, Tabs } from '@mui/material';
import moment from 'moment';
import { limitOrderHour } from '../lib/constant';
import { Order } from '../admin/orders/page';
import Sidebar from '../components/Sidebar';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '../utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '../components/OrderView';
import NotificationPopup from '../admin/components/Notification';
import { useRouter } from 'next/navigation';
import { TourProvider } from '@reactour/tour';
import TourStartButton from './TourStartButton';
import { grey } from '@mui/material/colors';
import OldOrderVersion from './OldOrderVersion';

const steps = [
  {
    selector: '[data-tour="first-step"]',
    content: 'These categories help you quickly find and select items.',
  },
  {
    selector: '[data-tour="second-step"]',
    content: 'Use search to quickly find what you need',
  },
  {
    selector: '[data-tour="third-step"]',
    content:
      'Click on item you want, then type the quantity you need on the pop up screen',
  },
  {
    selector: '[data-tour="fourth-step"]',
    content: 'You can view your order summary here.',
  },
  {
    selector: '[data-tour="fifth-step"]',
    content: 'Finally, place your order and we will take care of the rest',
  },
];

export default function OrderForm() {
  const [itemList, setItemList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tabIdx, setTabIdx] = useState<number>(0);

  const router = useRouter();
  const { showNotification, notification, closeNotification } = useNotification(
    {
      vertical: 'top',
      horizontal: 'right',
    },
  );

  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, _mutate, isValidating] = SWRFetchData(API_URL.CLIENT_ITEM);

  useEffect(() => {
    if (!items && isValidating) {
      setIsLoading(true);
    } else {
      initializeItems();
      setIsLoading(false);
    }
  }, [items]);

  // useEffect(() => {
  //   if (lastOrder) {
  //     setIsOverrideOrderOpen(true);
  //   }
  // }, [lastOrder]);

  // Get list of items to render input field
  const initializeItems = () => {
    const formatItems = items?.data?.items
      .map((item: any) => {
        return { ...item, quantity: 0 };
      })
      .filter((item: any) => item.inventoryItem.typeId !== null);

    setItemList(formatItems);
  };

  const onSubmit = async (order: Order): Promise<any> => {
    // Check if items are selected
    if (order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return;
    }

    // Check if any item quantity is decimal number or less than 1
    for (const item of order.items) {
      if (item.quantity % 1 !== 0) {
        showNotification('error', 'Item quantity must be a whole number');
        return;
      }
    }

    // Check is delivery date valid
    const deliveryDateObj = dayjs(order.deliveryDate);
    if (
      deliveryDateObj.isBefore(minDate) ||
      (deliveryDateObj.date() === 1 && deliveryDateObj.month() === 0)
    ) {
      showNotification('error', 'Delivery date is not valid');
      return;
    }

    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      const itemsNo0 = order.items.filter((item: any) => item.quantity > 0);

      if (itemsNo0.length === 0) {
        showNotification('error', 'Please select at least one item');
        return;
      }

      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        createdAt: `${timeString} ${dateString}`,
        items: itemsNo0,
        createdBy: USER_ROLE.CLIENT,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return response;
      }

      if (response.data.warning) {
        showNotification('warning', response.data.warning);
        return response;
      }
      showNotification('success', response.data.message);

      // SHOULD BE /user/overview after website is done
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.response.data.error);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <LoadingComponent />
        </div>
      </Sidebar>
    );
  }

  return (
    <TourProvider steps={steps}>
      <Sidebar>
        <NotificationPopup
          notification={notification}
          onClose={() => {
            setTimeout(() => {
              closeNotification();
            }, 3000);
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />

        <Tabs
          variant="fullWidth"
          sx={{ backgroundColor: grey[50] }}
          value={tabIdx}
          onChange={(e, value) => setTabIdx(value)}
        >
          <Tab value={0} label="New Version ✨" />
          <Tab value={1} label="Old Version 👴🏼" />
        </Tabs>

        {tabIdx === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            height="100vh"
            width="100%"
          >
            <Box display="flex" justifyContent="flex-end">
              <TourStartButton />
            </Box>
            <Box
              sx={{
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                pb: 3,
              }}
            >
              <OrderView
                onSubmit={onSubmit}
                items={itemList}
                purpose={ORDER_USAGE_PURPOSE.ORDER}
                role={USER_ROLE.CLIENT}
              />
            </Box>
          </Box>
        ) : (
          <OldOrderVersion
            onSubmit={onSubmit}
            itemList={itemList}
            setItemList={setItemList}
            minDate={minDate}
          />
        )}
      </Sidebar>
    </TourProvider>
  );
}
