import {
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import { IOption } from '@/app/utils/type';
import { grey } from '@mui/material/colors';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  option: IOption;
}

export default function DeleteOption({ open, onClose, option }: IProps) {
  const [relevantItemPreOrders, setRelevantItemPreOrders] = useState<any>([]);

  const [itemInPreOrders] = SWRFetchData(
    `${API_URL.ADMIN}/scheduledOrders/by-option?optionName=${option?.name}&categoryId=${option?.item?.categoryId}&itemName=${option?.item?.name}`,
  );

  useEffect(() => {
    if (itemInPreOrders) {
      setRelevantItemPreOrders(itemInPreOrders?.data);
    }
  }, [itemInPreOrders]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <Typography variant="h5">Delete {option?.name} Option</Typography>

        <Typography variant="subtitle1" sx={{ color: grey[500] }}>
          There are 10 pre orders has item included this `{option?.name}`
          option. Please acknowledge that we will assign another option to those
          pre orders or you can assign another option to them.
        </Typography>

        <Typography variant="h6">Relevant Pre Orders</Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pre Order Id</TableCell>
              <TableCell>Client Id - Name</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Item Quantity</TableCell>
              <TableCell>Item Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relevantItemPreOrders.length > 0 &&
              relevantItemPreOrders.map((item: any) => (
                <TableRow key={item?.id}>
                  <TableCell>{item?.ScheduleOrders.id}</TableCell>
                  <TableCell>
                    {item?.ScheduleOrders?.user?.clientId} -{' '}
                    {item?.ScheduleOrders?.user?.clientName}
                  </TableCell>
                  <TableCell>{item?.name}</TableCell>
                  <TableCell>{item?.quantity}</TableCell>
                  <TableCell>{item?.price}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </BoxModal>
    </Modal>
  );
}
