import {
  Box,
  Divider,
  MenuItem,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { BoxModal } from '../styled';
import ModalHead from '@/app/lib/ModalHead';
import { ModalProps } from '../type';
import useSelectDate from '@/hooks/useSelectDate';
import { SWRFetchData } from '@/app/utils/db';
import { days } from '@/app/lib/constant';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { IRoutes } from '@/app/utils/type';
import { filterByRoute } from '@/app/utils/array';
import useCODAndWCOD from '@/hooks/useCODAndWCOD';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { grey } from '@mui/material/colors';

interface IProps extends ModalProps {
  currentDate: string;
  codData: any;
  setCodData: any;
  showNotification: any;
}

export default function AddTempCOD({
  open,
  onClose,
  codData,
  setCodData,
  currentDate,
  showNotification,
}: IProps) {
  const { date, SelectDate } = useSelectDate('', true);
  const [currentRoute, setCurrentRoute] = useState<number>(0);

  const selectedDate = new Date(date);

  // Data Fetching
  const [routes] = SWRFetchData(
    `${API_URL.ROUTES}?day=${days[selectedDate.getDay()]}`,
  );

  const [orders] = SWRFetchData(
    `${API_URL.ORDER}?date=${date}&status=${ORDER_STATUS.NONE}`,
  );

  const filteredOrders = useMemo(() => {
    if (!orders || orders?.data?.length === 0) {
      return [];
    }

    if (currentRoute === 0) {
      return orders.data;
    }

    // Get the route
    const targetRoute = routes.data.find(
      (route: IRoutes) => route.id === currentRoute,
    );

    // Get clients from that route -> get orders
    const fitleredOrders = filterByRoute(orders.data, targetRoute);
    return fitleredOrders;
  }, [currentRoute, orders]);

  const { uncollectedCODBill, collectedCODBill, collectedCODOrders, uncollectedCODOrders } =
    useCODAndWCOD(filteredOrders, date);

  const addTempCod = () => {
    if (date === currentDate) {
        showNotification('error', 'Please select other date');
        return;
    }
    setCodData({
      ...codData,
      uncollectedCODBill: codData.uncollectedCODBill + uncollectedCODBill,
      uncollectedCODOrders: [...codData.uncollectedCODOrders, ...uncollectedCODOrders],
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal>
        <ModalHead
          heading="Add Temporary COD"
          buttonLabel="ADD"
          onClick={addTempCod}
          buttonProps={{}}
          onClose={onClose}
        />

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Typography variant="subtitle1">COD Date</Typography>
            {SelectDate}
          </Box>

          <Box display="flex" flexDirection="column" gap={1.5}>
            <Typography variant="subtitle1">Route</Typography>
            <Select
              sx={{ background: 'white' }}
              value={currentRoute}
              onChange={(e: any) => setCurrentRoute(+e.target.value)}
              fullWidth
            >
              <MenuItem value={0}>All</MenuItem>
              {routes &&
                routes.data.map((route: IRoutes) => {
                  return (
                    <MenuItem key={route.id} value={route.id}>
                      {route.name} - {route?.driver?.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </Box>
        </Box>

        <Table style={{marginTop: 2}}>
          <TableHead>
            <TableRow>
              <TableCell sx={{width: '10px'}}></TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Number of orders</TableCell>
              <TableCell>Bill</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
                <TableCell>
                    <AddTaskIcon fontSize="small" sx={{color: grey[500]}} />
                </TableCell>
              <TableCell> 
                Uncollected COD Orders
              </TableCell>
              <TableCell>{uncollectedCODOrders.length}</TableCell>
              <TableCell>{uncollectedCODBill}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell></TableCell>
              <TableCell>Collected COD Orders</TableCell>
              <TableCell>{collectedCODOrders.length}</TableCell>
              <TableCell>{collectedCODBill}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </BoxModal>
    </Modal>
  );
}
