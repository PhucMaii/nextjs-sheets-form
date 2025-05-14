import { AlertColor, Modal } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import { Order } from '../../orders/page';
import { API_URL, USER_ROLE, getAdminApiUrl } from '@/app/utils/enum';
import SingleFieldEdit from './edit/SingleFieldEdit';
import axios from 'axios';
import DeleteModal from './delete/DeleteModal';
// import { SWRFetchData } from '@/app/utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { onUpdateOrder } from '@/app/utils/orders';
import { useParams } from 'next/navigation';
interface IProps extends ModalProps {
  order: Order;
  hideButton?: boolean;
  showNotification: (type: AlertColor, message: string) => void;
}

const OrderDetails = ({
  open,
  onClose,
  order,
  showNotification,
  hideButton,
}: IProps) => {
  const { companyId }: any = useParams();

  const [isOpenEditNote, setIsOpenEditNote] = useState<boolean>(false);
  const [isOpenClearNote, setIsOpenClearNote] = useState<boolean>(false);
  const [clientItems, setClientItems] = useState<any>([]);

  console.log('order?.user?.categoryId', order?.user?.categoryId);
  useEffect(() => {
    if (order?.user?.categoryId) {
      fetchClientItems();
    }
  }, [order?.user?.categoryId]);

  const fetchClientItems = async () => {
    try {
      const response = await axios.get(
        getAdminApiUrl(
          companyId,
          `/items?categoryId=${order?.user?.categoryId}`,
        ),
      );

      console.log('response.data.data', response.data.data);

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      setClientItems(response.data.data);
    } catch (error: any) {
      console.log('Fail to fetch client items: ', error);
    }
  };

  // console.log('Fetching items for categoryId:', order?.user?.categoryId);
  // console.log('Client items response:', clientItems);

  // useEffect(() => {
  //   if (order.items) {
  //     setItems(order.items);
  //   }

  //   // setUpdatedNote(order?.note || '');
  // }, [order]);
  // useEffect(() => {
  //   if (clientItems?.data && order.items) {
  //     const newBaseItems = clientItems?.data.map((item: Item) => {
  //       const isExistedInOrder = order.items.find(
  //         (orderItem: OrderedItems) => orderItem.name === item.name,
  //       );

  //       if (isExistedInOrder) {
  //         return isExistedInOrder;
  //       }

  //       return {
  //         ...item,
  //         id: 0,
  //         quantity: 0,
  //         itemId: item.id,
  //         orderId: order.id,
  //       };
  //     });

  //     setBaseItems(newBaseItems);
  //   }
  // }, [order, clientItems]);

  // useEffect(() => {
  //   if (debounceKeywords) {
  //     const newBaseItems = baseItems.filter((item: Item) => {
  //       return item.name.toLowerCase().includes(debounceKeywords.toLowerCase());
  //     });

  //     setItems(newBaseItems);
  //   } else {
  //     setItems(order?.items || []);
  //   }
  // }, [debounceKeywords, baseItems]);

  // const handlePrinting = useReactToPrint({
  //   content: () => billPrintRef.current,
  // });

  // const totalQuantity = useMemo(() => {
  //   const quantity = order.items.reduce((acc: number, cV: any) => {
  //     return acc + cV.quantity;
  //   }, 0);

  //   return quantity;
  // }, [order]);

  const onClearNote = async (selectedOrder: Order) => {
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/clear-note'),
        {
          orderId: selectedOrder.id,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to clear note: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  const onUpdateNote = async (updatedNote: string) => {
    if (updatedNote === order?.note) {
      showNotification('error', 'No update provided to note');
      return;
    }
    try {
      const response = await axios.put(API_URL.ORDER, {
        orderId: order.id,
        note: updatedNote,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to update note: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  const handleUpdateOrder = async (orderParam: any) => {
    try {
      const response = await onUpdateOrder(companyId, order.id, orderParam);

      if (response?.data?.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to update order: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  return (
    <>
      {/* <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        // addCustomAmount={handleAddCustomAmount}
        onUpdateUI={(data: any) =>
          setItems((prevState: any) => [...prevState, data])
        }
        orderId={order.id}
        showNotification={showNotification}
      /> */}
      <DeleteModal
        open={isOpenClearNote}
        handleCloseModal={() => setIsOpenClearNote(false)}
        handleDelete={onClearNote}
        targetObj={order}
        message="Are you sure to clear note ?"
      />
      {/* <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={billPrintRef} />
      </div> */}
      <SingleFieldEdit
        open={isOpenEditNote}
        onClose={() => setIsOpenEditNote(false)}
        handleUpdate={onUpdateNote}
        title="Note"
        inputLabel="Note"
        renderField="Note"
        defaultValue={order?.note || ''}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          maxHeight="80vh"
          overflow="auto"
        >
          <OrderView
            defaultDeliveryDate={order?.deliveryDate}
            defaultOrder={order}
            defaultOrderedItems={order?.items}
            items={clientItems || []}
            isModal
            onSubmit={handleUpdateOrder}
            role={USER_ROLE.ADMIN}
            clientName={order?.user?.clientName || ''}
            purpose={ORDER_USAGE_PURPOSE.ITEM}
            hideButton={hideButton}
          />
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(OrderDetails, (prev, next) => {
  return (
    Object.is(prev.order, next.order) &&
    // Object.is(prev.handleUpdateItem, next.handleUpdateItem) &&
    prev.open === next.open
    // Object.is(prev.onClose, next.onClose)
  );
});
