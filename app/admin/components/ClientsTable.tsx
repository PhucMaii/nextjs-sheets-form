'use clients';
import {
  Box,
  Checkbox,
  IconButton,
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
import StatusText, { COLOR_TYPE } from './StatusText';
import { ORDER_STATUS, ORDER_TYPE, PAYMENT_TYPE } from '@/app/utils/enum';
import { Order } from '../orders/page';
import EditReportOrder from './Modals/EditReportOrder';
import { Notification, UserType } from '@/app/utils/type';
import DeleteOrder from './Modals/DeleteOrder';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import { orderTypes, paymentTypes } from '@/app/lib/constant';

interface PropTypes {
  clients: UserType[];
  handleUpdateClient: (userId: number, updatedData: any) => void;
//   handleUpdateOrderUI?: (updatedOrder: Order) => void;
//   handleDeleteOrderUI?: (deletedOrder: Order) => void;
//   setNotification?: Dispatch<SetStateAction<Notification>>;
//   selectedOrders: UserType[];
//   handleSelectOrder: (e: any, order: Order) => void;
//   handleSelectAll: () => void;
//   isAdmin?: boolean;
}

const ClientsTable = ({
  clients,
  handleUpdateClient,
//   handleUpdateOrderUI,
//   handleDeleteOrderUI,
//   setNotification,
//   selectedOrders,
//   handleSelectOrder,
//   handleSelectAll,
//   isAdmin,
}: PropTypes) => {
  const windowDimensions = useWindowDimensions();


  function fixedHeaderContent() {
    return (
      <TableRow>
        <TableCell variant="head" style={{width: 50}}></TableCell>
        <TableCell padding="checkbox" variant="head">
          <Checkbox
            // checked={selectedOrders.length === clientOrders.length}
            // onClick={handleSelectAll}
          />
        </TableCell>
        <TableCell variant="head" style={{width: 150}}>Order Type</TableCell>
        <TableCell variant="head" style={{width: 150}}>Payment Type</TableCell>
        <TableCell variant="head" style={{width: 100}}>Client Id</TableCell>
        <TableCell variant="head" style={{width: 200}}>Name</TableCell>
        <TableCell variant="head" style={{width: 120}}>Category</TableCell>
        <TableCell variant="head" style={{width: 120}}>Contact Number</TableCell>
        <TableCell variant="head" style={{width: 200}}>Delivery Address</TableCell>
        <TableCell variant="head" style={{width: 120}}></TableCell>
        <TableCell></TableCell>
      </TableRow>
    );
  }

  function rowContent(_index: number, client: UserType) {
    // const isOrderSelected = selectedOrders.some(
    //   (targetOrder: Order) => order.id === targetOrder.id,
    // );
    return (
      <>
        <TableCell>
            {client?.preference?.orderType && <IconButton color="primary">
                <FindInPageIcon />
            </IconButton>}
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            // onClick={(e) => handleSelectOrder(e, order)}
            // checked={isOrderSelected}
          />
        </TableCell>
        <TableCell>
            <Select 
                value={client.preference?.orderType || 'N/A'}
                onChange={(e) => handleUpdateClient(client.id, {orderType: e.target.value})}
            >
                <MenuItem value={'N/A'}>N/A</MenuItem>
                {
                    orderTypes.map((type, index) => {
                        return (
                            <MenuItem key={index} value={type}>
                                {type.toUpperCase()}
                            </MenuItem>
                        )
                    })
                }
            </Select>
        </TableCell>
        <TableCell>
            <Select 
                value={client.preference?.paymentType || 'N/A'}
                onChange={(e) => handleUpdateClient(client.id, {paymentType: e.target.value})}
            >
                <MenuItem value={'N/A'}>N/A</MenuItem>
                {
                    paymentTypes.map((type, index) => {
                        return (
                            <MenuItem value={type} key={index}>
                                {type.toUpperCase()}
                            </MenuItem>
                        )
                    })
                }
            </Select>
        </TableCell>
        <TableCell>{client.clientId}</TableCell>
        <TableCell>{client.clientName}</TableCell>
        <TableCell>{client.category.name}</TableCell>
        <TableCell>{client.contactNumber}</TableCell>
        <TableCell>{client.deliveryAddress}</TableCell>
        {/* {isAdmin &&
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
          )} */}
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
      return (
        <TableRow
        //   aria-checked={isOrderSelected}
        //   selected={isOrderSelected}
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
    <Paper style={{ height: windowDimensions.height - 250, overflowX: 'auto' }}>
        <TableVirtuoso
            data={clients}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
        />
    </Paper>
  );
};

export default ClientsTable;
