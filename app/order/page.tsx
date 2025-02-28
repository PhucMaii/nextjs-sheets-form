'use client';
import React, { useEffect, useState } from 'react';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
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

  const router = useRouter();
  const { showNotification, notification, closeNotification } =
    useNotification();

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
    const formatItems = items.data.items.map((item: any) => {
      return { ...item, quantity: 0 };
    });

    setItemList(formatItems);
  };

  const onSubmit = async (order: Order) => {
    // Check if items are selected
    if (order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return;
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

      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        createdAt: `${timeString} ${dateString}`,
        items: order.items,
        createdBy: USER_ROLE.CLIENT,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      // SHOULD BE /user/overview after website is done
      router.push('/');

      showNotification('success', response.data.message);
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
        />
        <Box display="flex" justifyContent="flex-end">
          <TourStartButton />
        </Box>
        <Box pb={6} width="100%">
          <OrderView
            onSubmit={onSubmit}
            items={itemList}
            purpose={ORDER_USAGE_PURPOSE.ORDER}
            role={USER_ROLE.CLIENT}
          />
        </Box>
      </Sidebar>
    </TourProvider>
  );
}
