import { IRoutes } from '@/app/utils/type';
import {
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect, useMemo, useState } from 'react';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { SWRFetchData } from '@/app/utils/db';
import { getAdminApiUrl } from '@/app/utils/enum';
import { days } from '@/app/lib/constant';
import { filterByRoute } from '@/app/utils/array';
import useCODAndWCOD from '@/hooks/useCODAndWCOD';
import { useParams } from 'next/navigation';

interface IProps {
  codData: any;
  setCodData: any;
  date: string;
  orders: Order[];
  currentDate: string;
  showNotification: any;
  onClose: any;
}

export default function SelectRoute({
  codData,
  setCodData,
  date,
  orders,
  currentDate,
  showNotification,
  onClose,
}: IProps) {
  const { companyId }: any = useParams();
  const [currentRoute, setCurrentRoute] = useState<number>(0);
  const selectedDate = new Date(date);
  // Data Fetching
  const [routes] = SWRFetchData(
    getAdminApiUrl(companyId, `/routes?day=${days[selectedDate.getDay()]}`),
  );

  useEffect(() => {
    setCurrentRoute(0);
  }, [date]);

  const filteredOrders = useMemo(() => {
    if (!orders || orders?.length === 0) {
      return [];
    }

    if (currentRoute === 0) {
      return orders;
    }

    // Get the route
    const targetRoute = routes.data.find(
      (route: IRoutes) => route.id === currentRoute,
    );

    // Get clients from that route -> get orders
    const fitleredOrders = filterByRoute(orders, targetRoute);
    return fitleredOrders;
  }, [currentRoute, orders]);

  const {
    uncollectedCODBill,
    collectedCODBill,
    collectedCODOrders,
    uncollectedCODOrders,
  } = useCODAndWCOD(filteredOrders, date);

  const addTempCod = () => {
    if (date === currentDate) {
      showNotification('error', 'Please select other date');
      return;
    }
    setCodData({
      ...codData,
      uncollectedCODBill: codData.uncollectedCODBill + uncollectedCODBill,
      uncollectedCODOrders: [
        ...codData.uncollectedCODOrders,
        ...uncollectedCODOrders,
      ],
    });
    onClose();
  };
  return (
    <>
      <Box display="flex" flexDirection="column" gap={1.5} mt={2}>
        <Typography variant="subtitle1">Route</Typography>
        <Select
          size="small"
          sx={{ background: 'white' }}
          value={currentRoute}
          onChange={(e: any) => setCurrentRoute(+e.target.value)}
          fullWidth
        >
          <MenuItem value={0}>All</MenuItem>
          {routes &&
            routes?.data.map((route: IRoutes) => {
              return (
                <MenuItem key={route.id} value={route.id}>
                  {route.name} - {route?.driver?.name}
                </MenuItem>
              );
            })}
        </Select>
      </Box>

      <Table style={{ marginTop: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '10px' }}></TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Number of orders</TableCell>
            <TableCell>Bill</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <AddTaskIcon fontSize="small" sx={{ color: grey[500] }} />
            </TableCell>
            <TableCell>Uncollected COD Orders</TableCell>
            <TableCell>{uncollectedCODOrders.length}</TableCell>
            <TableCell>{uncollectedCODBill.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Collected COD Orders</TableCell>
            <TableCell>{collectedCODOrders.length}</TableCell>
            <TableCell>{collectedCODBill.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Button fullWidth variant="contained" onClick={addTempCod} sx={{ mt: 2 }}>
        Add
      </Button>
    </>
  );
}
