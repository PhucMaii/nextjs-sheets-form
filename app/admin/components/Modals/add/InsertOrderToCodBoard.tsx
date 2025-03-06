import {
  Autocomplete,
  Box,
  Divider,
  Modal,
  Tab,
  Tabs,
  TextField,
  Typography,
  // useMediaQuery,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import OrderSearch from '../../Autocomplete/OrderSearch';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { Order } from '@/app/admin/orders/page';
import axios from 'axios';

interface IProps extends ModalProps {
  currentDate: string;
  showNotification: any;
  boardId: number;
  mutateBoards: any;
  role: USER_ROLE;
}

export default function InsertOrderToCodBoard({
  open,
  onClose,
  currentDate,
  showNotification,
  boardId,
  mutateBoards,
  role,
}: IProps) {
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>({
    id: -1,
    clientName: '-- Choose Client --',
  });
  const [tabIndex, setTabIndex] = useState<number>(0);
  const { date, SelectDate } = useSelectDate(currentDate, true);

  // const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const endDate = new Date(date);
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 30);

  const fetchUrl = () => {
    if (role === USER_ROLE.ADMIN) {
      return selectedClient && selectedClient?.id !== -1
        ? `${API_URL.ADMIN}/clients/orders?userId=${selectedClient?.id}&startDate=${startDate}&endDate=${endDate}`
        : `${API_URL.ORDER}?date=${date}&status=${ORDER_STATUS.NONE}`;
    } else {
      return selectedClient && selectedClient?.id !== -1
        ? `${API_URL.DRIVER}/orders/clients?userId=${selectedClient?.id}&startDate=${startDate}&endDate=${endDate}`
        : `${API_URL.DRIVER}/orders?deliveryDate=${date}`;
    }
  };

  const [orders] = SWRFetchData(fetchUrl());

  console.log('orders: ', orders);

  const [clients] = SWRFetchData(
    `${role === USER_ROLE.ADMIN ? API_URL.ADMIN : API_URL.DRIVER}/clients`,
  );

  useEffect(() => {
    if (tabIndex === 0) {
      setSelectedClient({ id: -1, clientName: '-- Choose Client --' });
    }
  }, [tabIndex]);

  const onChangeSelectOrders = (e: any, value: Order[]) => {
    console.log('value: ', value);
    setSelectedOrders(value.length ? value : []);
  };

  const handleInsertOrders = async () => {
    setIsInserting(true);
    try {
      if (boardId === -1) {
        showNotification('error', 'Please select board');
        return;
      }

      if (selectedOrders.length === 0) {
        showNotification('error', 'Please select orders');
        return;
      }

      const url = role === USER_ROLE.ADMIN ? API_URL.ADMIN : API_URL.DRIVER;
      const response = await axios.post(`${url}/cod/insert-orders`, {
        orders: selectedOrders,
        boardId,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsInserting(false);
        return;
      }

      mutateBoards();

      showNotification('success', response.data.message);

      onClose();
      setSelectedOrders([]);

      setIsInserting(false);
    } catch (error) {
      console.log('There was an error: ', error);
      showNotification('error', 'There was an error: ' + error);

      setIsInserting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Insert Orders"
          onClose={onClose}
          onClick={handleInsertOrders}
          buttonProps={{ loading: isInserting }}
          buttonLabel="INSERT"
        />

        <Divider sx={{ my: 2 }} />

        <Tabs
          variant="fullWidth"
          value={tabIndex}
          onChange={(e, value) => setTabIndex(value)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="By Date" value={0} />
          <Tab label="By Client" value={1} />
        </Tabs>

        {tabIndex === 0 ? (
          <Box display="flex" flexDirection={'column'} gap={2}>
            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Date</Typography>
              {SelectDate}
            </Box>

            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Orders</Typography>
              <OrderSearch
                orders={
                  (role === USER_ROLE.ADMIN
                    ? orders?.data
                    : orders?.data?.deliveryOrders) || []
                }
                onChangeSelectOrders={onChangeSelectOrders}
                selectedOrders={selectedOrders}
              />
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection={'column'} gap={2}>
            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Clients</Typography>
              <Autocomplete
                options={[
                  { id: -1, clientName: '-- Choose Client --' },
                  ...(clients?.data || []),
                ]}
                // PopperComponent={(props: any) => (
                //   <Popper
                //     {...props}
                //     placement={mdDown ? 'top-start' : 'auto'}
                //   />
                // )}
                getOptionLabel={(option: any) => option.clientName}
                renderOption={(props, option) => (
                  <li {...props} aria-disabled={option.id === -1}>
                    {option.clientName}
                  </li>
                )}
                style={{ width: '100%' }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Client" />
                )}
                value={selectedClient}
                onChange={(e: any, value: any) => setSelectedClient(value)}
              />
            </Box>

            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Orders</Typography>
              <OrderSearch
                orders={orders?.data ? orders.data : []}
                onChangeSelectOrders={onChangeSelectOrders}
                selectedOrders={selectedOrders}
              />
            </Box>
          </Box>
        )}
      </BoxModal>
    </Modal>
  );
}
