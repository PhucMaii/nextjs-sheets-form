'use clients';
import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { Dispatch, SetStateAction, memo } from 'react';
import { API_URL } from '@/app/utils/enum';
import { Notification, IRoutes, ScheduledOrder } from '@/app/utils/type';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import axios from 'axios';
import EditScheduleOrder from '../Modals/edit/EditScheduleOrder';
import { DELETE_OPTION } from '@/pages/api/admin/scheduledOrders/DELETE';
import DeleteScheduleOrder from '../Modals/delete/DeleteScheduleOrder';

interface PropTypes {
  clientOrders: ScheduledOrder[];
  handleUpdateOrderUI: (updatedOrder: ScheduledOrder) => void;
  handleDeleteOrderUI: (deletedOrder: ScheduledOrder) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
  selectedOrders: ScheduledOrder[];
  handleSelectOrder: (e: any, order: ScheduledOrder) => void;
  handleSelectAll: () => void;
  routeId: number;
  routes: IRoutes[];
}

const ScheduleOrdersTable = ({
  clientOrders,
  handleUpdateOrderUI,
  handleDeleteOrderUI,
  setNotification,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  routeId,
  routes,
}: PropTypes) => {
  const windowDimensions = useWindowDimensions();

  const handleDeleteOrder = async (
    order: ScheduledOrder,
    deleteOption: DELETE_OPTION,
  ) => {
    try {
      const response = await axios.delete(API_URL.SCHEDULED_ORDER, {
        data: {
          scheduleOrderId: order.id,
          deleteOption,
          userId: order.userId,
          routeId,
        },
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        return;
      }

      handleDeleteOrderUI(order);
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
    } catch (error: any) {
      console.log('Fail to delete order: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to delete order: ' + error,
      });
    }
  };

  function fixedHeaderContent() {
    return (
      <TableRow>
        <TableCell padding="checkbox" variant="head">
          <Checkbox
            checked={selectedOrders.length === clientOrders.length}
            onClick={handleSelectAll}
          />
        </TableCell>
        <TableCell variant="head" style={{ width: 100 }}>
          Schedule Order Id
        </TableCell>
        <TableCell variant="head" style={{ width: 100 }}>
          Client Id
        </TableCell>
        <TableCell variant="head" style={{ width: 150 }}>
          Client Name
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          Total Bill
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}></TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, order: ScheduledOrder) {
    const isOrderSelected = selectedOrders.some(
      (targetOrder: ScheduledOrder) => order.id === targetOrder.id,
    );
    return (
      <>
        <TableCell padding="checkbox">
          <Checkbox
            onClick={(e) => handleSelectOrder(e, order)}
            checked={isOrderSelected}
          />
        </TableCell>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.user.clientId}</TableCell>
        <TableCell>{order.user.clientName}</TableCell>
        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <DeleteScheduleOrder
              targetObj={order}
              handleDelete={handleDeleteOrder}
            />
            <EditScheduleOrder
              routeId={routeId}
              routes={routes}
              order={order}
              setNotification={setNotification}
              handleUpdateOrderUI={handleUpdateOrderUI}
              handleDeleteOrderUI={handleDeleteOrderUI}
            />
          </Box>
        </TableCell>
      </>
    );
  }

  const VirtuosoTableComponents: TableComponents<any> = {
    Table: (props) => (
      <Table
        {...props}
        sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }}
      />
    ),
    TableHead,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TableRow: ({ item: item, ...props }) => {
      const isOrderSelected = selectedOrders.some(
        (targetOrder: ScheduledOrder) => item.id === targetOrder.id,
      );
      return (
        <TableRow
          aria-checked={isOrderSelected}
          selected={isOrderSelected}
          sx={{ cursor: 'pointer' }}
          {...props}
        />
      );
    },
    TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
      <TableBody {...props} ref={ref} />
    )),
  };

  return (
    <>
      <Paper style={{ height: windowDimensions.height - 250, width: '100%' }}>
        <TableVirtuoso
          data={clientOrders}
          components={VirtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          itemContent={rowContent}
        />
      </Paper>
    </>
  );
};

export default memo(ScheduleOrdersTable);
