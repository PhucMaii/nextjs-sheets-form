import { AlertColor, Divider, Modal } from '@mui/material';
import React from 'react';
import { BoxModal } from '../styled';
import { ModalProps } from '../type';
import axios from 'axios';
import { USER_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import { Order } from '../../../orders/page';
import ModalHead from '@/app/lib/ModalHead';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

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
  const { companyId }: any = useParams();

  // const [sellingItems] = SWRFetchData(
  //   getAdminApiUrl(companyId, `/items?userId=${order.userId}`),
  // );

  const { data: sellingItems } = useQuery({
    queryKey: ['items', companyId, order.userId],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/items?userId=${order.userId}`),
      );
      return response.data;
    },
    enabled: !!order.userId,
  });

  const onUpdateOrder = async (orderParam: Order) => {
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orderedItems'),
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
          clientName={order?.user?.clientName}
          isModal
          role={USER_ROLE.ADMIN}
        />
      </BoxModal>
    </Modal>
  );
}
