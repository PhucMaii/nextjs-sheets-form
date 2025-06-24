'use client';
import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  OutlinedInput,
  Skeleton,
  Switch,
  Typography,
} from '@mui/material';
import { ShadowSection } from '../../reports/styled';
import OrderedItemsTable from '../../components/Tables/OrderedItemsTable';
import { ArrowBackIos, KeyboardArrowDown } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StatusText, { COLOR_TYPE } from '../../components/StatusText';
import { grey } from '@mui/material/colors';
import OrderTimeline from '../../components/Timeline/OrderTimeline';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAdminApiUrl, ORDER_STATUS, TYPE } from '@/app/utils/enum';
import { Order } from '../page';
import OrderDetails from '../../components/Modals/OrderDetails';
import { ComponentToPrint } from '../../components/Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import useNotification from '@/hooks/useNotification';
import LoadingModal from '../../components/Modals/LoadingModal';
import DeleteModal from '../../components/Modals/delete/DeleteModal';
import { PaymentStatus } from '@prisma/client';
import { HandCoinsIcon, TruckIcon } from 'lucide-react';
import { LoadingButton } from '@mui/lab';
import DisplayFile from '../../components/Modals/DisplayFile';

const OrderDetailsPage = () => {
  const { id, companyId }: any = useParams();
  const router = useRouter();
  const { showNotification, NotificationComp } = useNotification();

  const queryClient = useQueryClient();
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', Number(id)],
    queryFn: async () => {
      const response = await axios.get(
        getAdminApiUrl(companyId, `/orders?orderId=${id}`),
      );
      if (response.status === 200) {
        return response.data.data as Order;
      }
      throw new Error('Failed to fetch order');
    },
  });

  type StatusUpdateParams = {
    status: ORDER_STATUS | PaymentStatus;
    type: 'fulfillment' | 'payment';
  };

  const { mutateAsync: handleUpdateStatus } = useMutation<
    { status: ORDER_STATUS | PaymentStatus } | null,
    Error,
    StatusUpdateParams
  >({
    mutationKey: ['order', Number(id), 'status'],
    mutationFn: async (params: StatusUpdateParams) => {
      const { status, type } = params;
      return handleChangeStatus(status, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', Number(id)] });
    },
  });

  const { mutateAsync: deleteOrder } = useMutation({
    mutationKey: ['order', Number(id), 'delete'],
    mutationFn: (targetOrder: Order) => handleDeleteOrder(targetOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', Number(id)] });
    },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notes, setNotes] = useState<string>('');
  const [isOpenOrderDetails, setIsOpenOrderDetails] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState<boolean>(false);
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order) {
      setNotes(order.note || '');
    }
  }, [order]);

  const statusText = {
    text: order?.status,
    type:
      order?.status === ORDER_STATUS.COMPLETED
        ? COLOR_TYPE.SUCCESS
        : order?.status === ORDER_STATUS.DELIVERED
          ? COLOR_TYPE.INFO
          : order?.status === ORDER_STATUS.INCOMPLETED
            ? COLOR_TYPE.WARNING
            : COLOR_TYPE.ERROR,
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleChangeStatus = async (
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    if (!showNotification) {
      return;
    }

    // e.stopPropagation();
    const updateData: any = {};

    if (type === 'fulfillment') {
      updateData.status = status;
    } else if (type === 'payment') {
      updateData.paymentStatus = status;
    }
    try {
      setIsMarking(true);
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/status'),
        {
          ...order,
          ...updateData,
        },
      );

      showNotification('success', response.data.message);
      setIsMarking(false);

      return response.data.data;
    } catch (error) {
      console.log('Fail to update status: ', error);
      setIsMarking(false);
      return null;
    } finally {
      setIsMarking(false);
    }
  };

  const handleDeleteOrder = async (targetOrder: Order) => {
    if (!showNotification) {
      return;
    }

    try {
      const response = await axios.delete(
        getAdminApiUrl(companyId, '/clients/orders'),
        {
          data: { orderId: targetOrder.id },
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      router.back();
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    }
  };

  const { mutateAsync: updateNotes } = useMutation({
    mutationKey: ['order', Number(id), 'notes'],
    mutationFn: async (notes: string) => {
      setIsUpdatingNotes(true);
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/notes'),
        {
          notes,
          orderId: Number(id),
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', Number(id)] });
      setIsUpdatingNotes(false);
    },
    onError: () => {
      setIsUpdatingNotes(false);
    },
  });

  const moreActions = (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        disabled={order?.type === TYPE.LOCKED}
        variant="outlined"
        color="primary"
      >
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={700}>
            More actions
          </Typography>
          <KeyboardArrowDown />
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={order?.isAffectInventory}
                // onChange={handleAvoidInventory}
              />
            }
            label="Affect Inventory"
            labelPlacement="end"
          />
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={order?.type === TYPE.LOCKED}
          onClick={() => setIsOpenOrderDetails(true)}
        >
          Edit order
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handlePrint();
          }}
        >
          Print
        </MenuItem>
        {/* {handleRemoveOrder && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveOrder([order]);
            }}
          >
            Remove
          </MenuItem>
        )} */}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setIsOpenDeleteModal(true);
          }}
        >
          Delete
        </MenuItem>

        <Divider />
        <ListSubheader>Fullfilment Status</ListSubheader>
        <MenuItem
          onClick={() =>
            handleUpdateStatus({
              status: ORDER_STATUS.DELIVERED,
              type: 'fulfillment',
            })
          }
        >
          Mark as fulfilled
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleUpdateStatus({
              status: ORDER_STATUS.INCOMPLETED,
              type: 'fulfillment',
            })
          }
        >
          Mark as unfulfilled
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleUpdateStatus({
              status: ORDER_STATUS.VOID,
              type: 'fulfillment',
            })
          }
        >
          Mark as void
        </MenuItem>

        <Divider />
        <ListSubheader>Payment Status</ListSubheader>

        <MenuItem
          onClick={() =>
            handleUpdateStatus({ status: PaymentStatus.Paid, type: 'payment' })
          }
        >
          Mark as paid
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleUpdateStatus({
              status: PaymentStatus.Unpaid,
              type: 'payment',
            })
          }
        >
          Mark as unpaid
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Sidebar>
      <LoadingModal open={isMarking} />
      {NotificationComp}
      {order && (
        <div style={{ display: 'none' }}>
          <ComponentToPrint order={order as Order} ref={printRef} />
        </div>
      )}
      <DeleteModal
        targetObj={order}
        handleDelete={async () => {
          await deleteOrder(order as Order);
        }}
        open={isOpenDeleteModal}
        handleCloseModal={() => setIsOpenDeleteModal(false)}
        showTargetObj={order?.id}
      />
      {isOpenOrderDetails && (
        <OrderDetails
          open={isOpenOrderDetails}
          onClose={() => setIsOpenOrderDetails(false)}
          order={order as Order}
          showNotification={showNotification}
        />
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={1} alignItems="center">
          <IconButton onClick={() => router.back()}>
            <ArrowBackIos />
          </IconButton>
          <Typography variant="h5">#{order?.id}</Typography>
          <StatusText type={statusText.type} text={statusText.text} />
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Button
            onClick={() => setIsOpenOrderDetails(true)}
            variant="contained"
            color="primary"
          >
            Edit
          </Button>
          <Button onClick={handlePrint} variant="outlined" color="primary">
            Print
          </Button>
          {moreActions}
        </Box>
      </Box>

      <Grid container spacing={1}>
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {isLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <ShadowSection>
              <Box
                sx={{
                  borderColor: 'divider',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <StatusText type={statusText.type} text={statusText.text} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                  Products
                </Typography>

                <OrderedItemsTable items={order?.items || []} />
              </Box>
              {order?.status === ORDER_STATUS.INCOMPLETED && (
                <Box
                  display="flex"
                  gap={1}
                  alignItems="center"
                  justifyContent="flex-end"
                  mt={1}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      handleUpdateStatus({
                        status: ORDER_STATUS.DELIVERED,
                        type: 'fulfillment',
                      });
                    }}
                  >
                    <Box display="flex" gap={1} alignItems="center">
                      <TruckIcon size={16} style={{ color: 'white' }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Fulfill Items
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              )}
            </ShadowSection>
          )}

          {isLoading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <ShadowSection display="flex" flexDirection="column" gap={1}>
              <Box
                sx={{
                  borderColor: 'divider',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderRadius: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                {order?.paymentStatus && (
                  <StatusText
                    type={
                      order?.paymentStatus === PaymentStatus.Paid
                        ? 'success'
                        : order?.paymentStatus === PaymentStatus.Unpaid
                          ? 'error'
                          : 'warning'
                    }
                    text={order?.paymentStatus}
                    icon={
                      <AttachMoneyIcon
                        color={
                          order?.paymentStatus === PaymentStatus.Paid
                            ? 'success'
                            : 'error'
                        }
                        fontSize="small"
                      />
                    }
                  />
                )}
                <Typography variant="subtitle2" fontWeight={700}>
                  Payment
                </Typography>

                <Box display="flex" flexDirection="column" gap={0.5}>
                  {order?.discount ? (
                    <Box
                      display="flex"
                      gap={1}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight={500}>
                        Discount
                      </Typography>
                      <Typography variant="h6" fontWeight={500}>
                        -${order?.discount}
                      </Typography>
                    </Box>
                  ) : null}
                  <Box
                    display="flex"
                    gap={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={500}>
                      Subtotal
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      ${order?.subTotal?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    gap={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={500}>
                      GST
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      ${order?.GST?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    gap={1}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6" fontWeight={500}>
                      PST
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      ${order?.PST?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    gap={1}
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      $
                      {(
                        (order?.subTotal || 0) +
                        (order?.GST || 0) +
                        (order?.PST || 0)
                      )?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {order?.paymentStatus === PaymentStatus.Unpaid && (
                <Box
                  display="flex"
                  gap={1}
                  alignItems="center"
                  justifyContent="flex-end"
                  mt={1}
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleUpdateStatus({
                        status: PaymentStatus.Paid,
                        type: 'payment',
                      });
                    }}
                  >
                    <Box display="flex" gap={1} alignItems="center">
                      <HandCoinsIcon size={16} style={{ color: 'white' }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Collect Payment
                      </Typography>
                    </Box>
                  </Button>
                </Box>
              )}
            </ShadowSection>
          )}

          {isLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            // <ShadowSection>
            <>
              <Typography variant="subtitle2" fontWeight={700}>
                Order Timeline
              </Typography>
              <Box
                display="flex"
                justifyContent="flex-start"
                width="100%"
                gap={1}
                mt={1}
              >
                <OrderTimeline timeline={order?.timeline || null} />
              </Box>
            </>
            // </ShadowSection>
          )}
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          {order?.delivery?.medias.length > 0 && (
            <ShadowSection display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Delivery Proof
              </Typography>

              <DisplayFile
                fileKey={order?.delivery?.medias[0].fileKey}
                width="100%"
                height="100%"
                style={{
                  borderRadius: 10,
                  border: '1px solid #e0e0e0',
                  padding: 10,
                  objectFit: 'contain',
                }}
              />
            </ShadowSection>
          )}
          {isLoading ? (
            <Skeleton variant="rectangular" height={100} />
          ) : (
            <ShadowSection display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Notes
              </Typography>

              <OutlinedInput
                multiline
                rows={4}
                value={notes || ''}
                onChange={(e) => {
                  setNotes(e.target.value);
                }}
                placeholder="Add notes here..."
              />

              <Box display="flex" gap={1} justifyContent="flex-end">
                <LoadingButton
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    updateNotes(notes);
                  }}
                  loading={isUpdatingNotes}
                >
                  Update
                </LoadingButton>
              </Box>
            </ShadowSection>
          )}

          {isLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : (
            <ShadowSection display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle2" fontWeight={700}>
                Customer
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.clientId || 'N/A'}
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.clientName || 'N/A'}
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.email || 'N/A'}
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.contactNumber || 'N/A'}
              </Typography>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ my: 1, color: grey[600] }}
              >
                Delivery Address
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.deliveryAddress || 'N/A'}
              </Typography>

              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ my: 1, color: grey[600] }}
              >
                Category
              </Typography>

              <Typography variant="h6" fontWeight={500}>
                {order?.user?.category?.name || 'N/A'}
              </Typography>
            </ShadowSection>
          )}
        </Grid>
      </Grid>
    </Sidebar>
  );
};

export default OrderDetailsPage;
