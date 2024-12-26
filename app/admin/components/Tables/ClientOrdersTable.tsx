'use clients';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import React, { useState } from 'react';
import StatusText from '../StatusText';
import { API_URL, ORDER_STATUS } from '@/app/utils/enum';
import { Order } from '../../orders/page';
import EditReportOrder from '../Modals/edit/EditReportOrder';
import axios from 'axios';
import LoadingModal from '../Modals/LoadingModal';
import DeleteModal from '../Modals/delete/DeleteModal';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import useWindowDimensions from '@/hooks/useWindowDimensions';

interface PropTypes {
  clientOrders: Order[];
  handleUpdateOrderUI: (updatedOrder: Order) => void;
  handleDeleteOrderUI: (deletedOrder: Order) => void;
  showNotification: (type: AlertColor, message: string) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, order: Order) => void;
  handleSelectAll: () => void;
  mutateOrders: any;
}

const ClientOrdersTable = ({
  clientOrders,
  handleUpdateOrderUI,
  handleDeleteOrderUI,
  showNotification,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  // subCategories,
  mutateOrders,
}: PropTypes) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openEdit, setOpenEdit] = useState<any>({
    open: false,
    order: clientOrders[0],
  });
  const [openDelete, setOpenDelete] = useState<any>({
    open: false,
    order: clientOrders[0],
  });
  // const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  // const [page, setPage] = useState<number>(0);
  const windowDimensions = useWindowDimensions();

  const updateStatus = async (order: Order, updatedStatus: ORDER_STATUS) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL.ORDER}/status`, {
        id: order.id,
        status: updatedStatus,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      // Optimistic UI Update
      handleUpdateOrderUI({ ...order, status: updatedStatus });

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Fail to update status: ', error);
      showNotification('error', 'Fail to update status: ' + error);
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    try {
      const response = await axios.delete(`${API_URL.CLIENTS}/orders`, {
        data: { orderId: order.id },
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      handleDeleteOrderUI(order);

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    }
  };

  // const handleChangePage = (e: any, newPage: number) => {
  //   setPage(newPage);
  // }

  // const handleChangeRowsPerPage = (
  //   event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  // ) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

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
            {/* <DeleteModal
              includedButton
              targetObj={order}
              handleDelete={handleDeleteOrder}
            /> */}
            <Button
              color="error"
              onClick={() => setOpenDelete(() => ({ order, open: true }))}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                setOpenEdit(() => ({ order, open: true }));
              }}
            >
              Edit
            </Button>
            {/* <EditReportOrder
              // subCategories={subCategories}
              order={order}
              showNotification={showNotification}
              handleUpdateOrderUI={handleUpdateOrderUI}
            /> */}
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
      <DeleteModal
        open={openDelete.open}
        handleCloseModal={() =>
          setOpenDelete((prevState: any) => ({ ...prevState, open: false }))
        }
        targetObj={openDelete.order}
        handleDelete={handleDeleteOrder}
        showTargetObj={openDelete.order.user.clientName}
      />
      <EditReportOrder
        order={openEdit.order}
        open={openEdit.open}
        showNotification={showNotification}
        handleUpdateOrderUI={handleUpdateOrderUI}
        onClose={() =>
          setOpenEdit((prevState: any) => ({ ...prevState, open: false }))
        }
      />
      <LoadingModal open={isLoading} />
      <Paper
        style={{
          height: windowDimensions.height - 250,
          width: '100%',
          overflow: 'scroll',
        }}
      >
        {/* <Table sx={{ tableLayout: 'fixed', overflow: 'scroll' }}>
          <TableHead>
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
          </TableHead>

          <TableBody>
            {(rowsPerPage > 0 ? clientOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : clientOrders).map((order: Order, index: number) => {
              const isOrderSelected = selectedOrders.some(
                (targetOrder: Order) => order.id === targetOrder.id,
              );
              return (
                <TableRow key={index}>
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
                      <Button
                        color="error"
                        onClick={() =>
                          setOpenDelete(() => ({ order, open: true }))
                        }
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => {
                          setOpenEdit(() => ({ order, open: true }));
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={7}
              count={clientOrders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              slotProps={{
                select: {
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                },
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              // ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
        </Table> */}
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

export default ClientOrdersTable;
