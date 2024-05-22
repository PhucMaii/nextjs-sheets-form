'use clients';
import {
  Box,
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { Dispatch, SetStateAction, memo, useState } from 'react';
import StatusText from './StatusText';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../orders/page';
import EditReportOrder from './Modals/EditReportOrder';
import { Notification } from '@/app/utils/type';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import axios from 'axios';
import LoadingModal from './Modals/LoadingModal';
import DeleteModal from './Modals/DeleteModal';
import { SubCategory } from '@prisma/client';

interface PropTypes {
  clientOrders: Order[];
  handleUpdateOrderUI: (updatedOrder: Order) => void;
  handleDeleteOrderUI: (deletedOrder: Order) => void;
  setNotification: Dispatch<SetStateAction<Notification>>;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, order: Order) => void;
  handleSelectAll: () => void;
  subCategories: SubCategory[];
}

const ClientOrdersTable = ({
  clientOrders,
  handleUpdateOrderUI,
  handleDeleteOrderUI,
  setNotification,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  subCategories
}: PropTypes) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const windowDimensions = useWindowDimensions();

  const updateStatus = async (order: Order, updatedStatus: ORDER_STATUS) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL.ORDER}/status`, {
        id: order.id,
        status: updatedStatus,
      });

      if (response.data.error) {
        setNotification({
          on: true,
          type: 'error',
          message: response.data.error,
        });
        setIsLoading(false);
        return;
      }

      handleUpdateOrderUI({ ...order, status: updatedStatus });
      setNotification({
        on: true,
        type: 'success',
        message: response.data.message,
      });
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to update status: ', error);
      setNotification({
        on: true,
        type: 'error',
        message: 'Fail to update status: ' + error,
      });
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    try {
      const response = await axios.delete(`${API_URL.CLIENTS}/orders`, {
        data: { orderId: order.id },
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
      console.log('Fail to delete order: ' + error);
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
        <TableCell style={{ width: 100 }}></TableCell>
        <TableCell padding="checkbox" variant="head">
          <Checkbox
            checked={selectedOrders.length === clientOrders.length}
            onClick={handleSelectAll}
          />
        </TableCell>
        <TableCell variant="head" style={{ width: 100 }}>
          Invoice Id
        </TableCell>
        <TableCell variant="head" style={{ width: 100 }}>
          Client Id
        </TableCell>
        <TableCell variant="head" style={{ width: 150 }}>
          Client Name
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          Delivery Date
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          Total Bill
        </TableCell>
        <TableCell variant="head" style={{ width: 180 }}>
          Status
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}></TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, order: Order) {
    const isOrderSelected = selectedOrders.some(
      (targetOrder: Order) => order.id === targetOrder.id,
    );
    return (
      <>
        <TableCell>
          {order.isReplacement ? (
            <StatusText text="Replaced" type="error" />
          ) : order.isVoid ? (
            <StatusText text="Voided" type="error" />
          ) : (
            ''
          )}
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            onClick={(e) => handleSelectOrder(e, order)}
            checked={isOrderSelected}
          />
        </TableCell>
        <TableCell>{order.id}</TableCell>
        <TableCell>{order.user.clientId}</TableCell>
        <TableCell>{order.user.clientName}</TableCell>
        <TableCell>{order.deliveryDate}</TableCell>
        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
        <TableCell>
          <Select
            value={order.status}
            onChange={(e) =>
              updateStatus(order, e.target.value as ORDER_STATUS)
            }
          >
            <MenuItem value={ORDER_STATUS.COMPLETED}>
              <StatusText text="Completed" type="success" />
            </MenuItem>
            <MenuItem value={ORDER_STATUS.DELIVERED}>
              <StatusText text="Delivered" type="info" />
            </MenuItem>
            <MenuItem value={ORDER_STATUS.INCOMPLETED}>
              <StatusText text="Incompleted" type="warning" />
            </MenuItem>
            <MenuItem value={ORDER_STATUS.VOID}>
              <StatusText text="Void" type="error" />
            </MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={1}>
            <DeleteModal targetObj={order} handleDelete={handleDeleteOrder} />
            <EditReportOrder
              subCategories={subCategories}
              order={order}
              setNotification={setNotification}
              handleUpdateOrderUI={handleUpdateOrderUI}
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
        (targetOrder: Order) => item.id === targetOrder.id,
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
      <LoadingModal open={isLoading} />
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

export default memo(ClientOrdersTable);
