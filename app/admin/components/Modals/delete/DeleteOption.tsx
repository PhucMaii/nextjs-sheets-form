import {
  Box,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import { IOption } from '@/app/utils/type';
import { grey } from '@mui/material/colors';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL } from '@/app/utils/enum';

interface IProps extends ModalProps {
  option: IOption;
  allOptions: IOption[];
}

export default function DeleteOption({
  open,
  onClose,
  option,
  allOptions,
}: IProps) {
  const [relevantItemPreOrders, setRelevantItemPreOrders] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState<IOption | null>(null);

  const otherOptions = useMemo(() => {
    return allOptions.filter((o) => o.id !== option.id);
  }, [allOptions]);

  const [itemInPreOrders] = SWRFetchData(
    `${API_URL.ADMIN}/scheduledOrders/by-option?optionName=${option?.name}&categoryId=${option?.item?.categoryId}&itemName=${option?.item?.name}`,
  );

  useEffect(() => {
    if (otherOptions && otherOptions.length > 0) {
      setSelectedOption(otherOptions[0]);
    }
  }, [otherOptions])

  useEffect(() => {
    if (itemInPreOrders) {
      setRelevantItemPreOrders(itemInPreOrders?.data);
    }
  }, [itemInPreOrders]);

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <Typography variant="h6" fontWeight="regular">
          Delete <strong>{option?.name}</strong> Option
        </Typography>

        <Typography variant="subtitle1" sx={{ color: grey[500] }}>
          There are {relevantItemPreOrders?.length || 0} pre orders has item
          included this `{option?.name}` option. <br /> Please acknowledge that
          the selected option will be applied on those pre order items.
        </Typography>

        {/* Display list of other options to choose */}
        {otherOptions.length > 0 && (
          <Box display="flex" gap={2} alignItems="center">
            {otherOptions.map((o) => (
              <Box
                key={o?.id}
                // variant="body1"
                display="flex"
                sx={{
                  cursor: 'pointer',
                  height: 50,
                  width: 'fit-content',
                  px: 4,
                  py: 2,
                  backgroundColor: grey[200],
                  borderRadius: 2,
                  border: selectedOption?.id === o?.id ? '2px solid red' : '',
                }}
                onClick={() => setSelectedOption(o)}
                // justifyContent="center"
                // alignItems="center"
              >
                <Typography variant="body1" sx={{fontWeight: 'semibold'}}>{o?.name}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Typography variant="h6" mt={2} fontWeight="regular">
          Relevant Pre Orders
        </Typography>

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
