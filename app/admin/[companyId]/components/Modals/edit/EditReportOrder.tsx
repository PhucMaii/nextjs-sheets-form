import {
  AlertColor,
  // Button,
  Divider,
  Modal,
} from '@mui/material';
import React from 'react';
import { BoxModal } from '../styled';
import { Order } from '../../../orders/page';
import {} from '@/app/utils/time';
import { getAdminApiUrl, USER_ROLE } from '@/app/utils/enum';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { onUpdateOrder } from '@/app/utils/orders';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
interface PropTypes extends ModalProps {
  order: Order;
  // handleUpdateOrderUI: (updatedOrder: Order) => void;
  onUpdateOrderUI?: (updatedOrder: Order) => void;
  showNotification: (type: AlertColor, message: string) => void;
  mutateOrders: any;
}

const EditReportOrder = ({
  order,
  // handleUpdateOrderUI,
  showNotification,
  open,
  onClose,
  mutateOrders,
  onUpdateOrderUI,
}: PropTypes) => {
  const { companyId }: any = useParams();

  // const [sellingItems] = SWRFetchData(`${API_URL.ITEM}?userId=${order.userId}`);
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

  const onUpdateItem = async (orderParam: Order) => {
    try {
      const response = await onUpdateOrder(companyId, order.id, orderParam);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (onUpdateOrderUI) {
        onUpdateOrderUI(response.data.data);
      }
      mutateOrders();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'Fail to update item: ' + error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        maxHeight="80vh"
        overflow="scroll"
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <ModalHead
          onClose={onClose}
          heading="Edit Order"
          buttonLabel="UPDATE"
          onlyHeading
          onClick={() => {}}
          buttonProps={{}}
        />

        <Divider />

        <OrderView
          items={sellingItems?.data || []}
          defaultOrderedItems={order.items}
          defaultOrder={order}
          purpose={ORDER_USAGE_PURPOSE.ITEM}
          onSubmit={onUpdateItem}
          isModal
          role={USER_ROLE.ADMIN}
          clientName={order?.user?.clientName}
        />
      </BoxModal>
    </Modal>
  );
};

export default EditReportOrder;
