'use clients';
import {
  AlertColor,
  Box,
  Button,
  Checkbox,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from '@mui/material';
import React, { memo, useState } from 'react';
import StatusText from '../StatusText';
import {
  ORDER_STATUS,
  TYPE,
  USER_CATEGORIZED,
  getAdminApiUrl,
} from '@/app/utils/enum';
import { Order } from '../../orders/page';
import EditReportOrder from '../Modals/edit/EditReportOrder';
import axios from 'axios';
import LoadingModal from '../Modals/LoadingModal';
import DeleteModal from '../Modals/delete/DeleteModal';
import { TableComponents, TableVirtuoso } from 'react-virtuoso';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import { renderType } from '@/app/lib/render';
import LockIcon from '@mui/icons-material/Lock';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { grey } from '@mui/material/colors';
import { useParams, useRouter } from 'next/navigation';
import ApproveOrder from '../Modals/ApproveOrder';
import RejectOrder from '../Modals/RejectOrder';
import QuickViewOrderedItems from '../Tooltip/QuickViewOrderedItems';
import { PaymentStatus } from '@prisma/client';

interface PropTypes {
  clientOrders: Order[];
  onUpdateOrderUI?: (updatedOrder: Order) => void;
  // handleDeleteOrderUI: (deletedOrder: Order) => void;
  showNotification: (type: AlertColor, message: string) => void;
  selectedOrders: Order[];
  handleSelectOrder: (e: any, order: Order) => void;
  handleSelectAll: () => void;
  mutateOrders: any;
}

const ClientOrdersTable = ({
  clientOrders,
  // handleUpdateOrderUI,
  // handleDeleteOrderUI,
  showNotification,
  selectedOrders,
  handleSelectOrder,
  handleSelectAll,
  onUpdateOrderUI,
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
  const [openApproveOrder, setOpenApproveOrder] = useState<any>({
    open: false,
    order: null,
  });
  const [openRejectOrder, setOpenRejectOrder] = useState<any>({
    open: false,
    order: null,
  });

  const windowDimensions = useWindowDimensions();
  const { companyId }: any = useParams();
  const router = useRouter();

  const updateStatus = async (
    order: Order,
    updatedStatus: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    try {
      setIsLoading(true);
      const updateData: any = {};
      if (type === 'fulfillment') {
        updateData.status = updatedStatus;
      } else if (type === 'payment') {
        updateData.paymentStatus = updatedStatus;
      }

      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/status'),
        {
          id: order.id,
          ...updateData,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      // Optimistic UI Update
      // handleUpdateOrderUI({ ...order, status: updatedStatus });

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
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/clients/orders'),
        {
          data: { orderId: order.id },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      // Optimistic UI Update
      // handleDeleteOrderUI(order);

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
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
        <TableCell style={{ width: 100 }}>Type</TableCell>
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
          Items
        </TableCell>
        <TableCell variant="head" style={{ width: 120 }}>
          Total Bill
        </TableCell>
        <TableCell variant="head" style={{ width: 180 }}>
          Fulfillment Status
        </TableCell>
        <TableCell variant="head" style={{ width: 180 }}>
          Payment Status
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
          <Box display="flex" gap={1} alignItems="center">
            {order?.type === TYPE.LOCKED ? (
              <StatusText
                text={`Locked`}
                type={'info'}
                icon={<LockIcon color="info" fontSize="small" />}
              />
            ) : order.isReplacement ? (
              <StatusText text="Replaced" type="error" />
            ) : order.isVoid ? (
              <StatusText text="Voided" type="error" />
            ) : (
              ''
            )}
            {order?.note && order.note !== '' && (
              <Tooltip title={order.note}>
                <IconButton size="small">
                  <TextSnippetIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {order.status === ORDER_STATUS.PENDING && (
              <Box display="flex" gap={1} alignItems="center">
                <Button
                  color="success"
                  onClick={() =>
                    setOpenApproveOrder({
                      open: true,
                      order,
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  color="error"
                  onClick={() =>
                    setOpenApproveOrder({
                      open: true,
                      order,
                    })
                  }
                >
                  Reject
                </Button>
              </Box>
            )}
          </Box>
        </TableCell>
        <TableCell padding="checkbox">
          <Checkbox
            onClick={(e) => handleSelectOrder(e, order)}
            checked={isOrderSelected}
          />
        </TableCell>
        <TableCell>{order.id}</TableCell>
        <TableCell>
          {order?.user?.type && order?.user?.type !== USER_CATEGORIZED.NONE
            ? renderType(order.user.type)
            : ''}
        </TableCell>
        <TableCell>{order.user.clientId}</TableCell>
        <TableCell>{order.user.clientName}</TableCell>
        <TableCell>{order.deliveryDate}</TableCell>
        <TableCell>
          <QuickViewOrderedItems
            order={order}
            isTable={true}
            placement="bottom-start"
          />
        </TableCell>
        <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
        <TableCell>
          <Select
            value={order.status}
            onChange={(e) => {
              e.stopPropagation();
              e.preventDefault();
              updateStatus(
                order,
                e.target.value as ORDER_STATUS,
                'fulfillment',
              );
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            size="small"
            // disabled={order?.type === TYPE.LOCKED}
          >
            <MenuItem value={ORDER_STATUS.INCOMPLETED}>
              <StatusText text={ORDER_STATUS.INCOMPLETED} type="warning" />
            </MenuItem>
            <MenuItem value={ORDER_STATUS.DELIVERED}>
              <StatusText text={ORDER_STATUS.DELIVERED} type="info" />
            </MenuItem>
            <MenuItem value={ORDER_STATUS.VOID}>
              <StatusText text={ORDER_STATUS.VOID} type="error" />
            </MenuItem>
          </Select>
        </TableCell>
        <TableCell>
          <Select
            value={order?.paymentStatus || 'N/A'}
            onChange={(e) => {
              e.stopPropagation();
              e.preventDefault();
              updateStatus(order, e.target.value as PaymentStatus, 'payment');
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            size="small"
            // disabled={order?.type === TYPE.LOCKED}
          >
            <MenuItem value={'N/A'}>
              <StatusText text={'N/A'} type="grey" />
            </MenuItem>
            <MenuItem value={PaymentStatus.Paid}>
              <StatusText text={PaymentStatus.Paid} type="success" />
            </MenuItem>
            <MenuItem value={PaymentStatus.Unpaid}>
              <StatusText text={PaymentStatus.Unpaid} type="error" />
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
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                setOpenDelete(() => ({ order, open: true }));
              }}
            >
              Delete
            </Button>
            <Button
              // disabled={order?.type === TYPE.LOCKED}
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
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: grey[50] } }}
          onClick={() => {
            // if (item?.type === TYPE.LOCKED) return;
            // setOpenEdit(() => ({ order: item, open: true }));
            router.push(`/admin/${companyId}/orders/${item.id}`);
          }}
          // disabled={item?.type === TYPE.LOCKED}
          {...props}
        />
      );
    },
    // eslint-disable-next-line react/display-name
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
        showTargetObj={openDelete?.order?.user?.clientName}
      />
      <EditReportOrder
        order={openEdit.order}
        open={openEdit.open}
        showNotification={showNotification}
        // handleUpdateOrderUI={handleUpdateOrderUI}
        onClose={() =>
          setOpenEdit((prevState: any) => ({ ...prevState, open: false }))
        }
        mutateOrders={mutateOrders}
        onUpdateOrderUI={onUpdateOrderUI}
      />

      <ApproveOrder
        open={openApproveOrder.open}
        onClose={() =>
          setOpenApproveOrder({
            open: false,
            order: null,
          })
        }
        order={openApproveOrder?.order}
        showNotification={showNotification}
      />
      <RejectOrder
        open={openRejectOrder.open}
        onClose={() =>
          setOpenRejectOrder({
            open: false,
            order: null,
          })
        }
        order={openRejectOrder?.order}
        showNotification={showNotification}
      />
      <LoadingModal open={isLoading} />
      <Paper
        style={{
          height: windowDimensions.height - 250,
          width: '100%',
          overflow: 'scroll',
        }}
      >
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

export default memo(ClientOrdersTable, (prevProps, nextProps) => {
  return (
    prevProps.clientOrders === nextProps.clientOrders &&
    prevProps.selectedOrders === nextProps.selectedOrders
  );
});
