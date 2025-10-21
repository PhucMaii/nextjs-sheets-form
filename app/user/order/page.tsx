'use client';
import React, { useContext, useEffect, useState } from 'react';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL, FLAG_ORDER_TYPE, USER_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import moment from 'moment';
import { limitOrderHour } from '@/app/lib/constant';
import { Order } from '@/app/admin/[companyId]/orders/page';
import Sidebar from '@/app/components/Sidebar';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '@/app/utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import NotificationPopup from '@/app/admin/[companyId]/components/Notification';
import { useRouter } from 'next/navigation';
import { TourProvider } from '@reactour/tour';
import OverrideOrder from '../../components/Modals/OverrideOrder';
import { getNextOrderDate } from '@/pages/api/utils/date';
import ConfirmModal from '@/app/admin/[companyId]/components/Modals/ConfirmModal';
import { UserContext } from '@/app/context/UserContextAPI';
import UserHeader from '@/app/components/UserHeader';

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
  const { user } = useContext(UserContext);

  const [itemList, setItemList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enteredOrderAt, setEnteredOrderAt] = useState<any>();
  // const [tabIdx, setTabIdx] = useState<number>(0);
  const [isConfirmOrderFarNextDay, setIsConfirmOrderFarNextDay] =
    useState<boolean>(false);
  const [isOpenConfirmOrder, setIsOpenConfirmOrder] = useState<boolean>(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [overrideOrderProps, setOverrideOrderProps] = useState<any>({
    open: false,
    lastOrder: null,
    newOrder: null,
  });

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
  const [items, _mutate, isValidating] = SWRFetchData('/api/item');

  useEffect(() => {
    if (!items && isValidating) {
      setIsLoading(true);
    } else {
      initializeItems();
      setEnteredOrderAt(moment().format('YYYY/MM/DD HH:mm:ss'));
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
    console.log(formatItems, 'FORMAT ITEMS');
  };

  const onSubmit = async (order: Order): Promise<any> => {
    // Check if items are selected
    if (order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return { ok: false, error: 'Please select at least one item' };
    }

    // Check if any item quantity is decimal number or less than 1
    for (const item of order.items) {
      if (item.quantity % 1 !== 0) {
        showNotification('error', 'Item quantity must be a whole number');
        return { ok: false, error: 'Item quantity must be a whole number' };
      }
    }

    // Check is delivery date valid
    const deliveryDateObj = dayjs(order.deliveryDate);
    if (
      deliveryDateObj.isBefore(minDate) ||
      (deliveryDateObj.date() === 1 && deliveryDateObj.month() === 0)
    ) {
      showNotification('error', 'Delivery date is not valid');
      return { ok: false, error: 'Delivery date is not valid' };
    }

    if (user?.role === USER_ROLE.CLIENT) {
      const nextOrderDate = getNextOrderDate();
      const deliveryDateObjPST = new Date(order.deliveryDate);
      deliveryDateObjPST.setHours(0, 0, 0, 0);

      if (
        deliveryDateObjPST.getTime() > nextOrderDate.getTime() &&
        !isConfirmOrderFarNextDay
      ) {
        setOrder(order);
        setIsConfirmOrderFarNextDay(true);
        setIsOpenConfirmOrder(true);
        return {
          ok: false,
          error: 'Target delivery date is too far in the future',
        };
      }
    }

    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      const itemsNo0 = order.items.filter((item: any) => item.quantity > 0);

      if (itemsNo0.length === 0) {
        showNotification('error', 'Please select at least one item');
        return { ok: false, error: 'Please select at least one item' };
      }

      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        createdAt: `${timeString} ${dateString}`,
        items: itemsNo0,
        createdBy: USER_ROLE.CLIENT,
        enteredOrderAt,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return { ok: false, error: response.data.error };
      }

      if (response.data.warning) {
        showNotification('warning', response.data.warning);

        if (response.data.flag === FLAG_ORDER_TYPE.ALREADY_ORDER) {
          setOverrideOrderProps({
            open: true,
            lastOrder: response.data.lastOrder,
            newOrder: response.data.currentOrder,
          });
        }
        return { ok: false, error: response.data.warning };
      }
      showNotification('success', response.data.message);

      // SHOULD BE /user/overview after website is done
      setTimeout(() => {
        router.push('/user/overview');
      }, 500);

      return { ok: true };
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.response.data.error);
      return { ok: false, error: error.response.data.error };
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
      {overrideOrderProps.newOrder && overrideOrderProps.lastOrder && (
        <OverrideOrder
          showNotification={showNotification}
          lastOrder={overrideOrderProps.lastOrder}
          open={overrideOrderProps.open}
          onClose={() => {
            setOverrideOrderProps({
              open: false,
              lastOrder: null,
              newOrder: null,
            });
          }}
          newOrder={overrideOrderProps.newOrder}
        />
      )}
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

        {order && (
          <ConfirmModal
            open={isOpenConfirmOrder}
            onClose={() => {
              setIsOpenConfirmOrder(false);
              setOrder(null);
              setIsConfirmOrderFarNextDay(false);
            }}
            handleSubmit={async () => {
              await onSubmit(order as Order);
            }}
            showNotification={showNotification}
            title={`Are you sure you want to order for ${order.deliveryDate}?`}
            buttonLabel="CONFIRM"
            successMsg="Order placed successfully"
          />
        )}
        {/* <Typography textAlign="center" variant="h5" fontWeight="medium">
          Order
        </Typography> */}
        <UserHeader
          title="Order"
          subtitle="Place a new order"
          chipLabel={`${itemList.length} items available`}
        />

        <Box display="flex" flexDirection="column" gap={2} width="100%">
          <Box
            sx={{
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
              // overflowY: 'auto',
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
      </Sidebar>
    </TourProvider>
  );
}
