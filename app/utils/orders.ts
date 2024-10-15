import axios from 'axios';
import { Order } from '../admin/orders/page';
import { API_URL } from './enum';
import { OrderedItems } from './type';

export const updateStatus = async (
  status: string,
  selectedOrders: Order[],
  showNotification: any,
) => {
  try {
    const response = await axios.put(`${API_URL.ADMIN}/orders/status`, {
      status,
      updatedOrders: selectedOrders,
    });

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

export const updateOrderedItems = async (
  orderTotalPrice: number,
  order: Order,
  updatedItem: OrderedItems,
  showNotification: any,
) => {
  try {
    const response = await axios.put(`${API_URL.ADMIN}/orderedItems/single`, {
      ...updatedItem,
      orderId: order.id,
      orderTotalPrice,
    });

    if (response.data.error) {
      showNotification('error', response.data.error);
      return;
    }

    showNotification('success', 'Update Item Successfully');
    return response;
  } catch (error: any) {
    console.log('Fail to update order items: ', error);
    showNotification(
      'error',
      'Fail to update order items: ' + error.response.data.error,
    );
  }
};
