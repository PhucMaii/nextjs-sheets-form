import axios from 'axios';
import { Order } from '../admin/[companyId]/orders/page';
import { USER_CATEGORIZED } from './enum';
import { ScheduledOrder } from './type';
import { Dispatch, SetStateAction } from 'react';
import { getAdminApiUrl } from '@/app/utils/enum';

export const updateStatus = async (
  companyId: string,
  status: string,
  selectedOrders: Order[],
  showNotification: any,
) => {
  try {
    const orderIds = selectedOrders.map((order: Order) => {
      return order.id;
    });
    const response = await axios.put(
      getAdminApiUrl(companyId, '/orders/status'),
      {
        status,
        updatedOrderIds: orderIds,
      },
    );

    if (response.data.error) {
      showNotification('error', response.data.error);
      return;
    }

    showNotification('success', response.data.message);
  } catch (error: any) {
    console.log('Fail to mark all as completed: ', error);
    showNotification(
      'error',
      'Something went wrong: ' + error.response.data.error,
    );
  }
};

// export const updateOrderedItems = async (
//   companyId: string,
//   orderTotalPrice: number,
//   order: Order,
//   updatedItem: OrderedItems,
//   showNotification: any,
//   isConvertToCustom: boolean = false,
//   itemId = null,
// ) => {
//   try {
//     let response: any;

//     if (isConvertToCustom) {
//       response = await axios.put(
//         getAdminApiUrl(companyId, '/orderedItems/single/convert-to-custom'),
//         {
//           ...updatedItem,
//           orderId: order.id,
//           newUnits: updatedItem.units,
//           inventoryUnit: updatedItem.inventoryUnit,
//           itemId: itemId,
//         },
//       );
//     } else {
//       response = await axios.put(getAdminApiUrl(companyId, '/orderedItems/single'), {
//         ...updatedItem,
//         orderId: order.id,
//         orderTotalPrice,
//       });
//     }

//     if (response.data.error) {
//       showNotification('error', response.data.error);
//       return;
//     }

//     showNotification('success', 'Update Item Successfully');
//     return response;
//   } catch (error: any) {
//     console.log('Fail to update order items: ', error);
//     showNotification(
//       'error',
//       'Fail to update order items: ' + error.response.data.error,
//     );
//   }
// };

export const onSelectOrders = (
  targetOrder: Order,
  selectedOrders: Order[],
  setSelectedOrders: Dispatch<SetStateAction<Order[]>>,
) => {
  const selectedOrder = selectedOrders.find((order: Order) => {
    return order.id === targetOrder.id;
  });

  if (selectedOrder) {
    const newSelectedOrders = selectedOrders.filter((order: Order) => {
      return order.id !== targetOrder.id;
    });
    setSelectedOrders(newSelectedOrders);
  } else {
    setSelectedOrders([...selectedOrders, targetOrder]);
  }
};

export const onSelectAllOrders = (
  selectedOrders: Order[],
  baseOrders: Order[],
  setSelectedOrders: Dispatch<SetStateAction<Order[]>>,
) => {
  if (selectedOrders.length === baseOrders.length) {
    setSelectedOrders([]);
  } else {
    setSelectedOrders(baseOrders);
  }
};

export const checkIsPreOrderQualified = (scheduledOrder: ScheduledOrder) => {
  if (!scheduledOrder || !scheduledOrder.items) {
    return false;
  }
  const totalPriceGt0 = scheduledOrder.totalPrice > 0;
  const hasItems = scheduledOrder.items.length > 0;
  const hasOrdered = scheduledOrder?.alreadyOrder;
  const isBlocked = scheduledOrder?.blocked;
  const isInactive = scheduledOrder?.user?.type === USER_CATEGORIZED.INACTIVE;

  return totalPriceGt0 && hasItems && !hasOrdered && !isInactive && !isBlocked;
};

export const onUpdateOrder = async (
  companyId: string,
  orderId: number,
  orderParam: Order,
) => {
  try {
    const response = await axios.put(
      getAdminApiUrl(companyId, '/orderedItems'),
      {
        updatedItems: orderParam.items,
        orderId,
        note: orderParam.note,
        deliveryDate: orderParam.deliveryDate,
      },
    );

    return response;
  } catch (error: any) {
    console.log('There was an error: ', error);
    throw new Error('There was an error: ' + error?.response?.data?.error);
  }
};
