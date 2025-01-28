import { Modal, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import { Reorder } from 'framer-motion';
import { ScheduledOrder } from '@/app/utils/type';
import ErrorComponent from '../ErrorComponent';
import { ShadowSection } from '../../reports/styled';

interface IProps extends ModalProps {
  scheduledOrders: ScheduledOrder[];
}

export default function ReArrangementModal({
    open,
    onClose,
    scheduledOrders,
}: IProps) {
  const [orderList, setOrderList] = useState<ScheduledOrder[]>(scheduledOrders || []);

  useEffect(() => {
    if (scheduledOrders) {
      setOrderList(scheduledOrders)
    }
  }, [scheduledOrders])

  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal sx={{maxHeight: '80vh', overflowY: 'scroll'}}>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Re Arrangement
            </Typography>
            {
              orderList.length > 0 ? (
                <Reorder.Group
                  style={{padding: 0}}
                  values={orderList}
                  onReorder={setOrderList}
                >
                  {
                    orderList.map((scheduledOrder: ScheduledOrder, index: number) => {
                      return (
                        <Reorder.Item
                          value={scheduledOrder}
                          style={{ listStyle: 'none' }}
                          transition={{
                            type: 'spring',
                            damping: 10,
                            stiffness: 300,
                            mass: 1
                          }}
                          key={scheduledOrder.id}
                        >
                          <ShadowSection display="flex" alignItems="center" gap={2} p={2}>
                            <Typography>{index}.</Typography>
                            <Typography>{scheduledOrder.user.clientName}</Typography>
                          </ShadowSection>
                        </Reorder.Item>
                      )
                    })
                  }
                  
                </Reorder.Group>
              ) : <ErrorComponent errorText="No Order Found" />
            }
            
        </BoxModal>
    </Modal>
  )
}
