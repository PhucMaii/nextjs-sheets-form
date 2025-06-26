'use client';
import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ClientDetailsModal from './Modals/ClientDetailsModal';
import { Order } from '../orders/page';
import { useReactToPrint } from 'react-to-print';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import axios from 'axios';
import {
  ORDER_STATUS,
  TYPE,
  USER_CATEGORIZED,
  USER_ROLE,
  getAdminApiUrl,
} from '@/app/utils/enum';
import EditIcon from '@mui/icons-material/Edit';
import EditDeliveryDate from './Modals/edit/EditDeliveryDate';
import EditPrice from './Modals/edit/EditPrice';
import StatusText, { COLOR_TYPE } from './StatusText';
import { ComponentToPrint } from './Printing/ComponentToPrint';
import { ShadowSection } from '../reports/styled';
import PreviewIcon from '@mui/icons-material/Preview';
import OrderDetails from './Modals/OrderDetails';
import RememberMeIcon from '@mui/icons-material/RememberMe';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BlockIcon from '@mui/icons-material/Block';
import { useDiscount } from '@/hooks/useDiscount';
import ConfirmModal from './Modals/ConfirmModal';
import { useMultipleBoolean } from '@/hooks/useMultipleBoolean';
import LoadingModal from './Modals/LoadingModal';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import { renderType } from '@/app/lib/render';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useParams, useRouter } from 'next/navigation';
import ApproveGuest from './Modals/ApproveGuest';
import QuickViewOrderedItems from './Tooltip/QuickViewOrderedItems';

import { ShowNotificationType } from '@/hooks/useNotification';
import ApproveOrder from './Modals/ApproveOrder';
import RejectOrder from './Modals/RejectOrder';
import { PaymentStatus } from '@prisma/client';
import ViewImg from './ViewImg';
interface PropTypes {
  order: Order;
  showNotification?: ShowNotificationType;
  selectedOrders?: Order[];
  handleSelectOrder?: (e: any, targetOrder: Order) => void;
  // handleUpdateItem?: (
  //   orderTotalPrice: number,
  //   order: Order,
  //   updatedItem: OrderedItems,
  //   isConvertToCustom?: boolean,
  // ) => Promise<void>;
  mutateOrders?: any;
  handleOpenDetails?: any;
  isMarkDateDifference?: boolean;
  handleRemoveOrder?: (order: Order[]) => Promise<void>;
  showAddedBy?: boolean;
}

const OrderAccordion = ({
  order,
  showNotification,
  handleSelectOrder,
  selectedOrders,
  mutateOrders,
  handleOpenDetails,
  isMarkDateDifference,
  handleRemoveOrder,
  showAddedBy,
}: PropTypes) => {
  // console.log(order, 'order in accordion');
  const { companyId }: any = useParams();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [isEditDateOpen, setIsEditDateOpen] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isMarkButtonDisabled, setIsMarkButtonDisabled] =
    useState<boolean>(false);

  const [isApproveGuestOpen, setIsApproveGuestOpen] = useState<boolean>(false);
  const [isApproveOrderOpen, setIsApproveOrderOpen] = useState<boolean>(false);
  const [isRejectOrderOpen, setIsRejectOrderOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenEditPrice, setIsOpenEditPrice] = useState<boolean>(false);
  const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
  const [isOpenViewDelivery, setIsOpenViewDelivery] = useState<boolean>(false);
  const [open, setOpen] = useMultipleBoolean({
    isOpenConfirmModal: false,
  });
  // const [totalQuantity, setTotalQuantity] = useState(0);
  const statusText = {
    text: order.status,
    type:
      order.status === ORDER_STATUS.COMPLETED
        ? COLOR_TYPE.SUCCESS
        : order.status === ORDER_STATUS.DELIVERED
          ? COLOR_TYPE.INFO
          : order.status === ORDER_STATUS.INCOMPLETED
            ? COLOR_TYPE.WARNING
            : COLOR_TYPE.ERROR,
  };

  // console.log(order,'orders in accordion');

  const { discountPrice, DiscountText } = useDiscount(order.items, order);

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  const isOrderSelected = selectedOrders?.some(
    (targetOrder: Order) => order.id === targetOrder.id,
  );

  const latestUpdatePerson = useMemo(() => {
    // if (!order.createdBy && !order.updatedBy) {
    //   return 'Unknown';
    // }

    // if (order.updatedBy) {
    //   return order.updatedBy;
    // }

    return order.createdBy;
  }, [order]);

  // useEffect(() => {
  //   calculateTotalQuantity();
  // }, [order]);

  const handleAvoidInventory = async (e: any) => {
    if (!showNotification) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/isAffectInventory'),
        {
          id: order.id,
          isAffectInventory: e.target.checked,
        },
      );

      if (response.data.error) {
        showNotification('error', response.data.error);
        setIsLoading(false);
        return;
      }

      showNotification('success', response.data.message);
      setIsLoading(false);
    } catch (error: any) {
      console.log('Internal Server Error: ', error.response.data.error);
      showNotification(
        'error',
        'Internal Server Error: ' + error.response.data.error,
      );
      setIsLoading(false);
    }
  };

  const handleOpenClientModal = (e: any) => {
    e.stopPropagation();
    setIsClientModalOpen(true);
  };

  const componentRef: any = useRef();
  const handlePrinting = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleChangeStatus = async (
    e: any,
    status: ORDER_STATUS | PaymentStatus,
    type: 'fulfillment' | 'payment',
  ) => {
    if (!showNotification) {
      return;
    }

    e.stopPropagation();
    try {
      setIsMarkButtonDisabled(true);

      const updateData: any = {};

      if (type === 'fulfillment') {
        updateData.status = status;
        updateData.paymentStatus = null;
      } else if (type === 'payment') {
        updateData.paymentStatus = status;
        updateData.status = null;
      }
      const response = await axios.put(
        getAdminApiUrl(companyId, '/orders/status'),
        {
          ...order,
          ...updateData,
        },
      );

      // Update Real Data
      mutateOrders();
      showNotification('success', response.data.message);
      setIsMarkButtonDisabled(false);
    } catch (error) {
      console.log('Fail to update status: ', error);
    }
  };

  // const calculateTotalQuantity = () => {
  //   const quantity = order.items.reduce((acc: number, cV: any) => {
  //     return acc + cV.quantity;
  //   }, 0);

  //   setTotalQuantity(quantity);
  // };

  const onOpenApproveGuest = (e: any) => {
    e.stopPropagation();
    setIsApproveGuestOpen(true);
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

      // Update Real Data
      mutateOrders();

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to delete order: ' + error);
      showNotification('error', 'Fail to delete order: ' + error);
    }
  };

  const onSubmitConfirmModal = async () => {
    await handleDeleteOrder(order);
    setOpen('isOpenConfirmModal', false);
  };

  const actions = (
    <>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        disabled={order?.type === TYPE.LOCKED}
      >
        <MoreHorizIcon />
      </IconButton>
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
                onChange={handleAvoidInventory}
              />
            }
            label="Affect Inventory"
            labelPlacement="end"
          />
        </MenuItem>
        <Divider />
        <MenuItem
          disabled={order?.type === TYPE.LOCKED}
          onClick={() => setIsOpenEditPrice(true)}
        >
          Edit order
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handlePrinting();
          }}
        >
          Print
        </MenuItem>
        {handleRemoveOrder && (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveOrder([order]);
            }}
          >
            Remove
          </MenuItem>
        )}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setOpen('isOpenConfirmModal', true);
          }}
        >
          Delete
        </MenuItem>

        <Divider />
        <ListSubheader>Fullfilment Status</ListSubheader>
        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.COMPLETED
          }
          onClick={(e) =>
            handleChangeStatus(e, ORDER_STATUS.DELIVERED, 'fulfillment')
          }
        >
          Mark as fulfilled
        </MenuItem>
        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.INCOMPLETED
          }
          onClick={(e) =>
            handleChangeStatus(e, ORDER_STATUS.INCOMPLETED, 'fulfillment')
          }
        >
          Mark as unfulfilled
        </MenuItem>
        <MenuItem
          disabled={isMarkButtonDisabled || order.status === ORDER_STATUS.VOID}
          onClick={(e) =>
            handleChangeStatus(e, ORDER_STATUS.VOID, 'fulfillment')
          }
        >
          Mark as void
        </MenuItem>

        <Divider />

        <ListSubheader>Payment Status</ListSubheader>

        <MenuItem
          disabled={
            isMarkButtonDisabled || order.status === ORDER_STATUS.COMPLETED
          }
          onClick={(e) => handleChangeStatus(e, PaymentStatus.Paid, 'payment')}
        >
          Mark as paid
        </MenuItem>
        <MenuItem
          disabled={isMarkButtonDisabled || order.status === ORDER_STATUS.VOID}
          onClick={(e) =>
            handleChangeStatus(e, PaymentStatus.Unpaid, 'payment')
          }
        >
          Mark as unpaid
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <>
      <LoadingModal open={isLoading} />
      {order?.delivery?.medias?.length > 0 &&
        order?.delivery?.medias[0]?.fileKey ? (
          <ViewImg
            fileKeyFront={order?.delivery?.medias[0]?.fileKey || ''}
            open={isOpenViewDelivery}
            onClose={() => setIsOpenViewDelivery(false)}
          />
        ) : null}
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={componentRef} />
      </div>
      <ClientDetailsModal
        open={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        deliveryAddress={order?.user?.deliveryAddress || ''}
        contactNumber={order?.user?.contactNumber || ''}
        categoryName={order?.user?.category?.name || ''}
      />
      {order?.status === ORDER_STATUS.PENDING && showNotification && (
        <>
          <ApproveOrder
            open={isApproveOrderOpen}
            onClose={() => setIsApproveOrderOpen(false)}
            order={order}
            showNotification={showNotification}
          />
          <RejectOrder
            open={isRejectOrderOpen}
            onClose={() => setIsRejectOrderOpen(false)}
            order={order}
            showNotification={showNotification}
          />
        </>
      )}
      {order?.user?.type === USER_CATEGORIZED.PENDING && showNotification && (
        <ApproveGuest
          open={isApproveGuestOpen}
          onClose={() => setIsApproveGuestOpen(false)}
          client={order?.user}
          showNotification={showNotification}
        />
      )}
      {showNotification && (
        <>
          <EditDeliveryDate
            open={isEditDateOpen}
            onClose={() => setIsEditDateOpen(false)}
            order={order}
            showNotification={showNotification}
            mutateOrders={mutateOrders}
          />
          <EditPrice
            open={isOpenEditPrice}
            onClose={() => setIsOpenEditPrice(false)}
            showNotification={showNotification}
            order={order}
            mutateOrders={mutateOrders}
          />
          <ConfirmModal
            open={open.isOpenConfirmModal}
            onClose={() => setOpen('isOpenConfirmModal', false)}
            title="Are you sure to delete this order ?"
            buttonLabel="Delete"
            handleSubmit={onSubmitConfirmModal}
            showNotification={showNotification}
            color="error"
          />
        </>
      )}
      {isOpenDetails && showNotification && (
        <OrderDetails
          open={isOpenDetails}
          onClose={() => setIsOpenDetails(false)}
          order={order}
          // handleUpdateItem={handleUpdateItem}
          showNotification={showNotification}
        />
      )}
      <ShadowSection my={2}>
        <Grid container alignItems="center" columnSpacing={1} rowGap={1}>
          {handleSelectOrder && (
            <Grid item sm={0.5} xs={2}>
              <Checkbox
                checked={isOrderSelected}
                onClick={(e: any) => handleSelectOrder(e, order)}
              />
            </Grid>
          )}
          <Grid item xs={10} md={9}>
            <Box display="flex" alignItems="center" gap={1}>
              {order?.type === TYPE.LOCKED && (
                <StatusText
                  text={`Locked`}
                  type={'info'}
                  icon={<LockIcon color="info" fontSize="small" />}
                />
              )}
              {order?.previousUnpaidOrders && (
                <StatusText
                  text={`${order.previousUnpaidOrders.numberOfOrders} unpaid orders`}
                  type={'warning'}
                  icon={<WarningIcon color="warning" fontSize="small" />}
                />
              )}
              {order.isReplacement && (
                <StatusText
                  text={`Replacement by client `}
                  type={'info'}
                  icon={<InfoIcon color="info" fontSize="small" />}
                />
              )}
              {order.isVoid && (
                <StatusText
                  text={`Void by ${order?.updatedBy || 'client'} `}
                  type={'error'}
                  icon={<BlockIcon color="error" fontSize="small" />}
                />
              )}
              {isMarkDateDifference && (
                <StatusText
                  text={`Date difference`}
                  type={'info'}
                  icon={<InfoIcon color="info" fontSize="small" />}
                />
              )}
              {order?.multipleOrders && (
                <StatusText
                  text={`Multiple orders`}
                  type={'info'}
                  icon={<InfoIcon color="info" fontSize="small" />}
                />
              )}
              {showAddedBy && order?.addedToCODBy && (
                <StatusText
                  text={`Added by: ${order.addedToCODBy}`}
                  type={'info'}
                  icon={<InfoIcon color="info" fontSize="small" />}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={2.5} textAlign="right">
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={1}
            >
              {order?.status === ORDER_STATUS.PENDING && (
                <Box display="flex" gap={1} alignItems="center">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setIsApproveOrderOpen(true)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsRejectOrderOpen(true)}
                  >
                    Reject
                  </Button>
                </Box>
              )}
              <Box display="flex" gap={1} alignItems="center">
                {order?.paymentStatus === PaymentStatus.Unpaid ? (
                  <StatusText
                    text={`Unpaid`}
                    type={'error'}
                    icon={<AttachMoneyIcon color="error" fontSize="small" />}
                  />
                ) : order?.paymentStatus === PaymentStatus.Paid ? (
                  <StatusText
                    text={`Paid`}
                    type={'success'}
                    icon={<AttachMoneyIcon color="success" fontSize="small" />}
                  />
                ) : null}
                {order?.status !== ORDER_STATUS.PENDING && order?.profit
                  ? order.profit > 0 && (
                      <StatusText
                        text={`Profit: $${order.profit.toFixed(2)}`}
                        type={'success'}
                        icon={
                          <AttachMoneyIcon color="success" fontSize="small" />
                        }
                      />
                    )
                  : null}
              </Box>
              {showNotification ? actions : null}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" alignItems="center" gap={1}>
              <StatusText text={statusText.text} type={statusText.type} />
              {order?.delivery?.medias?.length > 0 && (
                <IconButton onClick={() => setIsOpenViewDelivery(true)}>
                  <ImageSearchIcon color="primary" fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              // gap={1}
            >
              <IconButton
                onClick={() => {
                  setIsOpenDetails(true);
                }}
              >
                <EditIcon color="primary" fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => {
                  if (handleOpenDetails) {
                    router.push(`/admin/${companyId}/orders/${order.id}`);
                    // handleOpenDetails();
                  } else {
                    // setIsOpenDetails(true);
                    router.push(`/admin/${companyId}/orders/${order.id}`);
                  }
                }}
                // disabled={order?.type === TYPE.LOCKED}
              >
                <PreviewIcon color="primary" fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center">
              <Typography fontWeight="bold" variant="subtitle1">
                #{order.id}
              </Typography>
              {order?.note && order.note !== '' && (
                <Tooltip title={order.note}>
                  <IconButton size="small">
                    <TextSnippetIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Typography variant="body2">Order at: {order.orderTime}</Typography>
          </Grid>
          {mdDown && (
            <Grid item xs={12} textAlign="right">
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Typography
                  fontWeight="bold"
                  variant="subtitle1"
                  textAlign="right"
                >
                  Delivery Date: {order.deliveryDate}
                </Typography>
                <IconButton
                  sx={{ width: '25px', height: '25px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDateOpen(true);
                  }}
                  disabled={order?.type === TYPE.LOCKED}
                >
                  <EditIcon sx={{ width: '20px', height: '20px' }} />
                </IconButton>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} md={4} textAlign={mdDown ? 'center' : 'left'}>
            <Button
              color={order?.user?.role === USER_ROLE.CLIENT ? 'info' : 'error'}
              variant={
                order?.user?.role === USER_ROLE.CLIENT
                  ? 'contained'
                  : 'outlined'
              }
              sx={{ textTransform: 'none' }}
              onClick={handleOpenClientModal}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="body2" fontWeight="medium">
                  {order?.clientName?.toUpperCase() ||
                    order?.user?.clientName?.toUpperCase()}
                </Typography>
                {order?.user?.type &&
                  order?.user?.role === USER_ROLE.CLIENT &&
                  order?.user?.type !== USER_CATEGORIZED.NONE &&
                  renderType(order.user.type)}

                {order?.user?.type === USER_CATEGORIZED.PENDING && (
                  <Button
                    onClick={onOpenApproveGuest}
                    variant="contained"
                    color="success"
                  >
                    Approve Client
                  </Button>
                )}
              </Box>
            </Button>
          </Grid>
          {!mdDown && (
            <Grid item xs={4} textAlign="right">
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Typography
                  fontWeight="bold"
                  variant="subtitle1"
                  textAlign="right"
                >
                  Delivery Date: {order.deliveryDate}
                </Typography>
                <IconButton
                  sx={{ width: '25px', height: '25px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDateOpen(true);
                  }}
                  disabled={order?.type === TYPE.LOCKED}
                >
                  <EditIcon sx={{ width: '20px', height: '20px' }} />
                </IconButton>
              </Box>
            </Grid>
          )}
          {mdDown && (
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="row"
                gap={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={1}
                >
                  <RememberMeIcon fontSize="small" color="primary" />
                  <Typography textAlign="center" variant="subtitle2">
                    {latestUpdatePerson}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  gap={1}
                  alignItems="center"
                >
                  <LocalShippingIcon color="primary" />
                  <Typography textAlign="center" variant="subtitle2">
                    {order?.orderRoute || ''}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  gap={1}
                  alignItems="center"
                >
                  <Typography textAlign="center" variant="subtitle2">
                    {order?.deliveredBy ? `Delivered:` : 'Driver:'}
                  </Typography>
                  <Typography textAlign="center" variant="subtitle2">
                    {order?.deliveredBy
                      ? `${order?.deliveredBy}`
                      : order?.orderRoute
                        ? `${order?.orderRoute?.split(' - ')[1]}`
                        : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid item xs={6} md={4}>
            <QuickViewOrderedItems order={order} />
            {/* <HtmlTooltip title={
              <Box display="flex" flexDirection="column" gap={1}>
                <StatusText text={order.status} type={order.status === ORDER_STATUS.COMPLETED ? 'success' : order.status === ORDER_STATUS.DELIVERED ? 'info' : order.status === ORDER_STATUS.INCOMPLETED ? 'warning' : 'error'} />
                
              </Box>
            } placement='top-start'>
              <Box display="flex" gap={1} alignItems="center">
                <SellIcon color="primary" />
                <Typography color="primary" variant="subtitle1">
                  {totalQuantity}
                </Typography>
              </Box>
            </HtmlTooltip> */}
          </Grid>
          {!mdDown && (
            <Grid item xs={4}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                alignItems="flex-start"
                justifyContent="flex-start"
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  <RememberMeIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2">
                    {latestUpdatePerson}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <LocalShippingIcon color="primary" />
                  <Typography variant="subtitle2">
                    {order?.orderRoute || ''}
                  </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <Typography variant="subtitle2">
                    {order?.deliveredBy
                      ? `Delivered: ${order?.deliveredBy}`
                      : order?.orderRoute
                        ? `Driver: ${order?.orderRoute?.split(' - ')[1]}`
                        : 'Driver: N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          <Grid item xs={6} md={4} textAlign="right">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              gap={1}
            >
              {discountPrice > 0 &&
                discountPrice.toFixed(2) !== order.totalPrice.toFixed(2) &&
                DiscountText}
              <Button variant="outlined">
                ${order?.totalPrice?.toFixed(2)}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </ShadowSection>
    </>
  );
};

// only re renders if th order data change
export default OrderAccordion;
