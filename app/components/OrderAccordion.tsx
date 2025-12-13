import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import StatusText, {
  COLOR_TYPE,
} from '../admin/[companyId]/components/StatusText';
import { Item, Order } from '../admin/[companyId]/orders/page';
import { ORDER_STATUS } from '../utils/enum';
import { blue, grey } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { errorColor } from '../../theme/color';
import EditOrder from './Modals/EditOrder';
import DeleteModal from './Modals/DeleteModal';
import SellIcon from '@mui/icons-material/Sell';
import { useDiscount } from '@/hooks/useDiscount';
import { PaymentStatus } from '@prisma/client';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ViewDelivery from './Modals/ViewDelivery';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../admin/[companyId]/components/Printing/ComponentToPrint';

interface PropTypes {
  handleDeleteOrder?: (orderId: number) => void;
  handleUpdateOrderUI?: (updatedOrder: Order) => void;
  order: Order;
  showNotification?: (type: AlertColor, message: string) => void;
  isEdit?: boolean;
  defaultExpanded?: boolean;
}

export default function OrderAccordion({
  order,
  showNotification,
  handleDeleteOrder,
  handleUpdateOrderUI,
  isEdit,
  defaultExpanded,
}: PropTypes) {
  const [isEditOrderOpen, setIsEditOrderOpen] = useState<boolean>(false);
  const [isDeleteOrderOpen, setIsDeleteOrderOpen] = useState<boolean>(false);
  const [isOpenViewDelivery, setIsOpenViewDelivery] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const printRef = useRef(null);

  const totalQuantity = order.items?.reduce((acc: number, cV: Item) => {
    return acc + cV.quantity;
  }, 0);
  const { discountPrice, DiscountText } = useDiscount(order.items, order);

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

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf/order-invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orders: [order],
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `order#${order.id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      showNotification?.('success', 'Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      showNotification?.('error', 'Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <ViewDelivery
        open={isOpenViewDelivery}
        onClose={() => setIsOpenViewDelivery(false)}
        order={order}
      />
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={printRef} />
      </div>
      {isEdit &&
        handleUpdateOrderUI &&
        handleDeleteOrder &&
        showNotification && (
          <>
            <EditOrder
              open={isEditOrderOpen}
              onClose={() => setIsEditOrderOpen(false)}
              order={order}
              showNotification={showNotification}
              handleUpdateOrderUI={handleUpdateOrderUI}
            />
            <DeleteModal
              isOpen={isDeleteOrderOpen}
              onClose={() => setIsDeleteOrderOpen(false)}
              handleDelete={() => handleDeleteOrder(order.id)}
            />
          </>
        )}
      <Accordion defaultExpanded={defaultExpanded}>
        <AccordionSummary>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" gap={1} alignItems="center">
                  <StatusText text={statusText.text} type={statusText.type} />
                  {order?.paymentStatus && !isEdit ? (
                    <StatusText
                      text={order?.paymentStatus}
                      type={
                        order?.paymentStatus === PaymentStatus.Paid
                          ? 'success'
                          : 'error'
                      }
                    />
                  ) : null}
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                  <IconButton
                    size="small"
                    sx={{
                      p: 1,
                      backgroundColor: `${blue[500]} !important`,
                      borderRadius: '50%',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: `${blue[600]} !important`,
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    {isDownloading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DownloadIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{
                      p: 1,
                      backgroundColor: `${blue[500]} !important`,
                      borderRadius: '50%',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: `${blue[600]} !important`,
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrint();
                    }}
                  >
                    <PrintIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  {isEdit && (
                    <>
                      <IconButton
                        sx={{
                          p: 1,
                          backgroundColor: `${errorColor} !important`,
                          borderRadius: '50%',
                          color: 'white',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteOrderOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditOrderOpen(true);
                        }}
                        sx={{
                          p: 1,
                          backgroundColor: `${blue[700]} !important`,
                          borderRadius: '50%',
                          color: 'white',
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography fontWeight="bold" variant="subtitle1">
                  #{order.id}
                </Typography>
                {order?.delivery?.medias?.length > 0 && (
                  <Button
                    startIcon={<ImageSearchIcon sx={{ fontSize: 16 }} />}
                    // variant="contained"
                    size="small"
                    sx={{ m: 0 }}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setIsOpenViewDelivery(true);
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontSize={12}
                      sx={{ textTransform: 'none' }}
                    >
                      Photo
                    </Typography>
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={2} sx={{ mr: 2 }}>
              <Typography variant="body2">
                Order at: {order.orderTime}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button variant="contained">
                {order?.clientName || order?.user?.clientName}
              </Button>
            </Grid>
            <Grid item xs={12} md={3} textAlign="left">
              <Typography fontWeight="bold" variant="subtitle1">
                Delivery Date: {order.deliveryDate}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box display="flex" gap={1} alignItems="center">
                  <SellIcon color="primary" />
                  <Typography color="primary" variant="subtitle1">
                    {totalQuantity}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  {discountPrice > 0 &&
                    discountPrice.toFixed(2) !== order.totalPrice.toFixed(2) &&
                    DiscountText}
                  <Button variant="outlined">
                    ${order.totalPrice.toFixed(2)}
                  </Button>
                </Box>
                {/* <Button variant="outlined">
                  ${order.totalPrice.toFixed(2)}
                </Button> */}
                {/* <Box display="flex" gap={1} alignItems="center">
                    <LocalShippingIcon color="primary" />
                    <Typography color="primary" variant="subtitle1">{order.deliveryDate}</Typography>
                  </Box> */}
              </Box>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: grey[50] }}>
          <Grid container rowGap={4} alignItems="flex-start">
            <Grid item textAlign="center" xs={12} md={6}>
              <Typography fontWeight="bold" variant="h6">
                ORDER
              </Typography>
              <Table sx={{ minWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.length > 0 &&
                    order.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" gap={1} flexDirection="column">
                            <Typography>{item.name}</Typography>
                            {item?.option && (
                              <Typography sx={{ color: grey[700] }}>
                                {item?.option?.name}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="row" gap={1}>
                            {item?.isShowDiscount &&
                              item?.prevPrice &&
                              item.prevPrice > 0 &&
                              (item.prevPrice * item.quantity).toFixed(2) !==
                                (item?.totalPrice?.toFixed(2) ||
                                  (item.quantity * item.price).toFixed(2)) && (
                                <Typography
                                  sx={{ textDecoration: 'line-through' }}
                                  color="error"
                                >
                                  ${(item.prevPrice * item.quantity).toFixed(2)}
                                </Typography>
                              )}
                            <Typography>
                              $
                              {item?.totalPrice?.toFixed(2) ||
                                (item.quantity * item.price).toFixed(2)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid
              container
              item
              textAlign="center"
              alignItems="center"
              rowGap={2}
              xs={12}
              md={6}
            >
              <Grid item xs={12}>
                <Typography fontWeight="bold" variant="h6">
                  NOTE
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  {order.note ? order.note : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} mt={4}>
                <Typography fontWeight="bold" variant="h6">
                  TOTAL
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography>Number of items</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">{totalQuantity} items</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              {order?.discount && order.discount > 0 ? (
                <>
                  <Grid item xs={4} textAlign="left" ml={2}>
                    <Typography>Discount ($)</Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography fontWeight="bold">
                      -${order?.discount?.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                </>
              ) : null}
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography>Subtotal</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  $
                  {order?.subTotal?.toFixed(2) ||
                    order?.totalPrice?.toFixed(2) ||
                    0}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography>GST (5%)</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  ${order?.GST?.toFixed(2) || 0}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography>PST (7%)</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  ${order?.PST?.toFixed(2) || 0}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={4} textAlign="left" ml={2}>
                <Typography>Total</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography fontWeight="bold">
                  ${order.totalPrice.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
