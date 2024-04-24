import React, { Dispatch, SetStateAction, memo } from 'react';
import OrderAccordion from './OrderAccordion';
import { Item, Order } from '../orders/page';
import { Notification } from '@/app/utils/type';

interface PropTypes {
  orderData: Order[];
  updateUIItem: (targetOrder: Order, targetItem: Item) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
  updateUI: (orderId: number) => void;
  handleUpdateDateUI: (orderId: number, updatedDate: string) => void;
}

const OrderList = ({
  orderData,
  setNotification,
  updateUIItem,
  updateUI,
  handleUpdateDateUI,
}: PropTypes) => {
  return (
    <>
      {orderData.map((order: any, index: number) => {
        return (
          <OrderAccordion
            key={index}
            order={order}
            setNotification={setNotification}
            updateUI={updateUI}
            updateUIItem={updateUIItem}
            handleUpdateDateUI={handleUpdateDateUI}
          />
        );
      })}
    </>
  );
};

export default memo(OrderList, (prev, next) => {
  return prev.orderData === next.orderData;
});
