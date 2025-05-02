import { Box, Divider, Modal, Typography } from '@mui/material';
import { ModalProps } from './type';
import ModalHead from '@/app/lib/ModalHead';
import { BoxModal } from './styled';
import OrderAccordion from '../OrderAccordion';
import { Order } from '@/app/admin/orders/page';
import { useState } from 'react';
import OrderDetails from './OrderDetails';
import { ShowNotificationType } from '@/hooks/useNotification';
import axios from 'axios';
import { USER_ROLE } from '@/app/utils/enum';

interface IProps extends ModalProps {
  orders: Order[];
  showNotification: ShowNotificationType;
  startDate: Date;
  endDate: Date;
  role: USER_ROLE;
}

export default function BlockOrders({ open, onClose, orders, showNotification, startDate, endDate, role }: IProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleVoidAndBlock = async () => {
    try {
      setIsLoading(true);

      const response = await axios.post(`/api/unavailable_days/void-and-block`, {
        orderIds: orders.map((order) => order.id),
        startDate,
        endDate,
        userId: orders[0].userId,
        role,
       });
       
       if (response.data.error) {
        showNotification('error', response.data.error);
        return;
       }

       showNotification('success', 'Orders voided and blocked successfully');
       onClose();
    } catch (error: any) {
      console.log('Something went wrong', error);
      showNotification('error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {selectedOrder && (
        <OrderDetails
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          showNotification={() => {}}
        />
      )}
      <Modal open={open} onClose={onClose}>
        <BoxModal maxHeight="80vh" overflow="scroll">
          <ModalHead
            heading="Orders In Range"
            buttonLabel="Void & Block"
            onClick={handleVoidAndBlock}
            buttonProps={{
              loading: isLoading,
            }}
            onClose={onClose}
          />  

          <Divider sx={{ my: 2 }} />

          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Orders In Range</Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {orders.map((order) => (
                <OrderAccordion
                  key={order.id}
                  order={order}
                  handleOpenDetails={() => {
                    setSelectedOrder(order);
                  }}
                  // showNotification={() => {}}
                  // selectedOrders={[]}
                  // handleSelectOrder={() => {}}
                  // mutateOrders={() => {}}
                />
              ))}
            </Box>
          </Box>
        </BoxModal>
      </Modal>
    </>
  );
}
