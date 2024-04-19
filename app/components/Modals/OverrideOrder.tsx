import { Divider, Grid, Modal, Typography } from '@mui/material';
import React, { Fragment, useState } from 'react';
import { Item, Order } from '@/app/admin/orders/page';
import { BoxModal } from '../../admin/components/Modals/styled';
import { ModalProps } from '@/app/admin/components/Modals/type';
import Input from '../Input';

interface PropTypes extends ModalProps {
  order: Order | null;
  deliveryDate: string;

}
export default function OverrideOrder({
    open,
    onClose,
    order,
    deliveryDate
}: PropTypes) {
  const [itemList, setItemList] = useState<Item[] | any>(order?.items);

  console.log(order, 'order in override order');
  return (
    <Modal open={open} onClose={onClose}>
        <BoxModal
            display="flex"
            flexDirection="column"
            gap={2}
        >
          <Typography variant="h5">
            You have ordered already for {deliveryDate}!
          </Typography>
          <Divider textAlign="center">Items</Divider>
          <Grid container>
            {
              itemList.length > 0 && itemList.map((item: Item, index: number) => {
                return (
                  <Fragment key={index}>
                    <Grid item xs={12}>
                      <Input<number> 
                        label={`${item.name} - $${item.price}`}
                        value={item.quantity}
                        onChange={() => {}}
                      />
                    </Grid>
                  </Fragment>
                )
              })
            }
          </Grid>
        </BoxModal>
    </Modal>
  )
}
