import {
  AlertColor,
  Divider,
  Modal,
} from '@mui/material';
import React from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import axios from 'axios';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import { Order } from '../../../orders/page';
import ModalHead from '@/app/lib/ModalHead';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { SWRFetchData } from '@/app/utils/db';

interface PropTypes extends ModalProps {
  showNotification: (type: AlertColor, message: string) => void;
  order: Order;
  mutateOrders: any;
}

export default function EditPrice({
  open,
  onClose,
  showNotification,
  order,
  mutateOrders,
}: PropTypes) {
  // const [updateOption, setUpdateOption] = useState<UpdateOption>(
  //   UpdateOption.NONE,
  // );

  const [sellingItems] = SWRFetchData(`${API_URL.ITEM}?userId=${order.userId}`);

  // const hasCustomAmount = useMemo(() => {
  //   if (itemList.length === 0) {
  //     return false;
  //   }

  //   return itemList.some((item: any) => !item?.inventoryItemId);
  // }, [itemList]);


  // const calculateNewTotalPrice = () => {
  //   const totalPrice = itemList.reduce((acc: number, cV: any) => {
  //     return acc + cV.totalPrice;
  //   }, 0);

  //   return totalPrice;
  // };

  // const handleNewItemOnChange = (key: string, value: any) => {
  //   setNewItem({ ...newItem, [key]: value });
  // };

  const onUpdateOrder = async (orderParam: Order) => {
    try {
      const response = await axios.put(API_URL.ORDERED_ITEMS, {
        updatedItems: orderParam.items,
        orderId: order.id,
        note: orderParam.note,
        deliveryDate: orderParam.deliveryDate,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'Fail to update price: ' + error.response.data.error,
      );
    }
  };

  // const handleItemOnChange = (e: any, targetItem: any) => {
  //   const newItemList = itemList.map((item: any) => {
  //     if (item.id === targetItem.id) {
  //       const newPrice = Number(e.target.value);
  //       const newTotal = newPrice * item.quantity;
  //       return { ...item, price: newPrice, totalPrice: newTotal };
  //     }
  //     return item;
  //   });
  //   setItemList(newItemList);
  // };

  // const removeItem = (itemName: string) => {
  //   const newItemList = itemList.filter((item: OrderedItems) => {
  //     return item.name !== itemName;
  //   });

  //   setItemList(newItemList);
  // };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight="80vh"
        overflow="auto"
      >
        <ModalHead
          heading="Edit Items"
          onClose={onClose}
          onlyHeading
          buttonLabel="Edit"
          onClick={() => {}}
          buttonProps={{}}
        />

        <Divider />

        <OrderView
          items={sellingItems?.data || []}
          defaultOrderedItems={order.items}
          defaultOrder={order}
          purpose={ORDER_USAGE_PURPOSE.ITEM}
          onSubmit={onUpdateOrder}
          isModal
          role={USER_ROLE.ADMIN}
        />
      </BoxModal>
    </Modal>
  );
}
