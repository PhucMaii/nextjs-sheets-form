import React from 'react';
import { BoxModal } from '@/app/admin/components/Modals/styled';
import { AlertColor, Modal } from '@mui/material';
import { ModalProps } from '@/app/admin/components/Modals/type';
import { Order } from '@/app/admin/orders/page';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { SWRFetchData } from '@/app/utils/db';
import axios from 'axios';

interface IProps extends ModalProps {
  order: Order;
  showNotification: (type: AlertColor, message: string) => void;
}

export default function OrderDetails({
  open,
  onClose,
  order,
  showNotification,
}: IProps) {
  const [items] = SWRFetchData(`${API_URL.CLIENT_ITEM}?userId=${order.userId}`);
  const onUpdateOrder = async (orderParam: Order) => {
    try {
      const response = await axios.put(
        `${API_URL.DRIVER}/orderedItems/update`,
        {
          updatedItems: orderParam.items,
          orderId: order.id,
          note: orderParam.note,
          deliveryDate: orderParam.deliveryDate,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification(
        'error',
        'Fail to update price: ' + error.response.data.error,
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        display="flex"
        flexDirection="column"
        gap={2}
        maxHeight="80vh"
        sx={{ overflowY: 'auto', overflowX: 'hidden', p: 2 }}
      >
        <OrderView
          items={items?.data?.items || []}
          purpose={ORDER_USAGE_PURPOSE.ITEM}
          isModal
          defaultDeliveryDate={order.deliveryDate}
          defaultOrderedItems={order?.items || []}
          defaultOrder={order}
          clientName={order?.clientName || order?.user?.clientName}
          role={USER_ROLE.DRIVER}
          onSubmit={onUpdateOrder}
        />
      </BoxModal>
    </Modal>
  );
}
