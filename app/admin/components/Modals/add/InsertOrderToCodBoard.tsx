import {
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ModalProps } from '../type';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import useSelectDate from '@/hooks/useSelectDate';
import OrderSearch from '../../Autocomplete/OrderSearch';
import { SWRFetchData } from '@/app/utils/db';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '@/app/admin/orders/page';
import axios from 'axios';

interface IProps extends ModalProps {
  currentDate: string;
  showNotification: any;
  boardId: number;
  mutateBoards: any;
}

export default function InsertOrderToCodBoard({
  open,
  onClose,
  currentDate,
  showNotification,
  boardId,
  mutateBoards,
}: IProps) {
  const [isInserting, setIsInserting] = useState<boolean>(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number>(-1);
  const [tabIndex, setTabIndex] = useState<number>(0);
  const { date, SelectDate } = useSelectDate(currentDate, true);

  const endDate = new Date(date);
  const startDate = new Date(date);
  startDate.setDate(startDate.getDate() - 30);

  const [orders] = SWRFetchData(
    selectedClientId !== -1
      ? `${API_URL.ADMIN}/clients/orders?userId=${selectedClientId}&startDate=${startDate}&endDate=${endDate}`
      : `${API_URL.ORDER}?date=${date}&status=${ORDER_STATUS.NONE}`,
  );

  const [clients] = SWRFetchData(`${API_URL.ADMIN}/clients`);

  useEffect(() => {
    if (tabIndex === 0) {
      setSelectedClientId(-1);
    }
  }, [tabIndex]);

  const onChangeSelectOrders = (e: any, value: Order[]) => {
    setSelectedOrders(value);
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

      const response = await axios.post(`${API_URL.ADMIN}/cod/insert-orders`, {
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
                orders={orders?.data || []}
                onChangeSelectOrders={onChangeSelectOrders}
                selectedOrders={selectedOrders}
              />
            </Box>
          </Box>
        ) : (
          <Box display="flex" flexDirection={'column'} gap={2}>
            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Clients</Typography>
              <Select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
              >
                <MenuItem value={-1} disabled>
                  -- Choose Client --
                </MenuItem>
                {clients &&
                  clients?.data?.map((client: any, index: number) => {
                    return (
                      <MenuItem key={index} value={client.id}>
                        {client.clientName}
                      </MenuItem>
                    );
                  })}
              </Select>
            </Box>

            <Box display="flex" flexDirection={'column'} gap={1}>
              <Typography variant="h6">Orders</Typography>
              <OrderSearch
                orders={orders?.data || []}
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
