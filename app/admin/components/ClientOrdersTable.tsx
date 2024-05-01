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
import StatusText, { COLOR_TYPE } from './StatusText';
import { ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../orders/page';
import EditReportOrder from './Modals/EditReportOrder';
import { Notification } from '@/app/utils/type';
import DeleteOrder from './Modals/DeleteOrder';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';

interface PropTypes {
  clientOrders: Order[];
  handleUpdateOrderUI?: (updatedOrder: Order) => void;
  handleDeleteOrderUI?: (deletedOrder: Order) => void;
  setNotification?: Dispatch<SetStateAction<Notification>>;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, order: Order) => void;
  handleSelectAll: () => void;
  isAdmin?: boolean;
}

const ClientOrdersTable = ({
  clientOrders,
  handleUpdateOrderUI,
  handleDeleteOrderUI,
  setNotification,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  isAdmin,
}: PropTypes) => {
  const windowDimensions = useWindowDimensions();

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
        <TableCell variant="head" style={{ width: 120 }}>
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

    const statusText = {
      text: order.status,
      type:
        order.status === ORDER_STATUS.COMPLETED
          ? COLOR_TYPE.SUCCESS
          : order.status === ORDER_STATUS.INCOMPLETED
            ? COLOR_TYPE.WARNING
            : COLOR_TYPE.ERROR,
    };
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
          <StatusText text={statusText.text} type={statusText.type} />
        </TableCell>
        {isAdmin &&
          setNotification &&
          handleDeleteOrderUI &&
          handleUpdateOrderUI && (
            <TableCell>
              <Box display="flex" gap={1}>
                <DeleteOrder
                  order={order}
                  setNotification={setNotification}
                  handleDeleteOrderUI={handleDeleteOrderUI}
                />
                <EditReportOrder
                  order={order}
                  setNotification={setNotification}
                  handleUpdateOrderUI={handleUpdateOrderUI}
                />
              </Box>
            </TableCell>
          )}
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
    <Paper style={{ height: windowDimensions.height - 250, width: '100%' }}>
      <TableVirtuoso
        data={clientOrders}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
};

export default memo(ClientOrdersTable);
