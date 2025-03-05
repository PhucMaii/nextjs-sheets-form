import {
  AlertColor,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ModalProps } from './type';
import { BoxModal } from './styled';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PrintIcon from '@mui/icons-material/Print';
import SellIcon from '@mui/icons-material/Sell';
import { Order } from '../../orders/page';
import { OrderedItems } from '@/app/utils/type';
import { ComponentToPrint } from '../Printing/ComponentToPrint';
import { useReactToPrint } from 'react-to-print';
import OrderDetailsTable from '../Tables/OrderDetailsTable';
import AddCustomAmount from './add/AddCustomAmount';
import EditIcon from '@mui/icons-material/Edit';
import { API_URL, TYPE, USER_ROLE } from '@/app/utils/enum';
import SingleFieldEdit from './edit/SingleFieldEdit';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteModal from './delete/DeleteModal';
import useDebounce from '@/hooks/useDebounce';
import { SWRFetchData } from '@/app/utils/db';
import { Item } from '@prisma/client';

interface IProps extends ModalProps {
  order: Order;
  handleUpdateItem: (
    orderTotalPrice: number,
    order: Order,
    updatedItem: OrderedItems,
    isConvertToCustom?: boolean,
  ) => Promise<void>;
  showNotification: (type: AlertColor, message: string) => void;
}

const OrderDetails = ({
  open,
  onClose,
  order,
  handleUpdateItem,
  showNotification,
}: IProps) => {
  const [baseItems, setBaseItems] = useState<any[]>([]);
  const [items, setItems] = useState<OrderedItems[] | any[]>(order.items);
  const [isOpenEditNote, setIsOpenEditNote] = useState<boolean>(false);
  const [isOpenClearNote, setIsOpenClearNote] = useState<boolean>(false);
  const [isOpenAddCustomAmount, setIsOpenAddCustomAmount] =
    useState<boolean>(false);
  const billPrintRef: any = useRef();
  const [searchKeywords, setSearchKeywords] = useState<string>('');

  const [clientItems] = SWRFetchData(
    `${API_URL.ITEM}?categoryId=${order?.user?.categoryId}`,
  );

  const debounceKeywords = useDebounce(searchKeywords, 1000);

  // useEffect(() => {
  //   if (order.items) {
  //     setItems(order.items);
  //   }

  //   // setUpdatedNote(order?.note || '');
  // }, [order]);
  useEffect(() => {
    if (clientItems?.data && order.items) {
      const newBaseItems = clientItems?.data.map((item: Item) => {
        const isExistedInOrder = order.items.find(
          (orderItem: OrderedItems) => orderItem.name === item.name,
        );

        if (isExistedInOrder) {
          return isExistedInOrder
        }

        return {
          ...item,
          id: 0,
          quantity: 0,
          itemId: item.id,
          orderId: order.id
        }
      });

      setBaseItems(newBaseItems);
    }
  }, [order, clientItems]);

  useEffect(() => {
    if (debounceKeywords) {
      const newBaseItems = baseItems.filter((item: Item) => {
        return item.name.toLowerCase().includes(debounceKeywords.toLowerCase());
      });

      setItems(newBaseItems);
    } else {
      setItems(order?.items || []);
    }  
  }, [debounceKeywords, baseItems]);

  const handlePrinting = useReactToPrint({
    content: () => billPrintRef.current,
  });

  const totalQuantity = useMemo(() => {
    const quantity = order.items.reduce((acc: number, cV: any) => {
      return acc + cV.quantity;
    }, 0);

    return quantity;
  }, [order]);

  const onClearNote = async (selectedOrder: Order) => {
    try {
      const response = await axios.put(`${API_URL.ADMIN}/orders/clear-note`, {
        orderId: selectedOrder.id,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to clear note: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  const onUpdateNote = async (updatedNote: string) => {
    if (updatedNote === order?.note) {
      showNotification('error', 'No update provided to note');
      return;
    }
    try {
      const response = await axios.put(API_URL.ORDER, {
        orderId: order.id,
        note: updatedNote,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('Fail to update note: ', error);
      showNotification('error', error?.response?.data?.error || error);
    }
  };

  // const handleAddCustomAmount = async (customAmount: any) => {
  //   try {
  //     const response = await axios.post(`${API_URL.ADMIN}/custom-amount`, {
  //       orderId: order.id,
  //       customAmount,
  //     });

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       return;
  //     }

  //     setItems((prevState: any) => {
  //       return [...prevState, response.data.data];
  //     });
  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('Internal Server Error: ', error);
  //     showNotification('error', error?.response?.data?.error);
  //   }
  // };

  return (
    <>
      <AddCustomAmount
        open={isOpenAddCustomAmount}
        onClose={() => setIsOpenAddCustomAmount(false)}
        // addCustomAmount={handleAddCustomAmount}
        onUpdateUI={(data: any) =>
          setItems((prevState: any) => [...prevState, data])
        }
        orderId={order.id}
        showNotification={showNotification}
      />
      <DeleteModal
        open={isOpenClearNote}
        handleCloseModal={() => setIsOpenClearNote(false)}
        handleDelete={onClearNote}
        targetObj={order}
        message="Are you sure to clear note ?"
      />
      <div style={{ display: 'none' }}>
        <ComponentToPrint order={order} ref={billPrintRef} />
      </div>
      <SingleFieldEdit
        open={isOpenEditNote}
        onClose={() => setIsOpenEditNote(false)}
        handleUpdate={onUpdateNote}
        title="Note"
        inputLabel="Note"
        renderField="Note"
        defaultValue={order?.note || ''}
      />
      <Modal open={open} onClose={onClose}>
        <BoxModal
          display="flex"
          flexDirection="column"
          gap={2}
          maxHeight="80vh"
          overflow="auto"
        >
          <Grid container alignItems="center">
            <Grid item xs={4}>
              <Typography variant="h6">#{order.id}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">{order.user.clientName}</Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Grid>
            <Grid item xs={10} md={6}>
              <Typography>Order at: {order.orderTime}</Typography>
            </Grid>
            <Grid item xs={2} md={6} textAlign="right">
              <IconButton onClick={handlePrinting}>
                <PrintIcon color="primary" />
              </IconButton>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <SellIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {totalQuantity}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalShippingIcon color="primary" />
              <Typography color="primary" variant="subtitle1">
                {order.deliveryDate}
              </Typography>
            </Box>
            <Button variant="outlined">${order.totalPrice.toFixed(2)}</Button>
          </Box>
          <Divider />
          <Grid container rowGap={4} alignItems="center">
            <Grid item xs={4} />
            <Grid item xs={4} textAlign="center">
              <Typography textAlign="center" fontWeight="bold" variant="h6">
                ORDER
              </Typography>
            </Grid>
            <Grid item xs={4} textAlign="right">
              {order?.type !== TYPE.LOCKED && (
                <Button onClick={() => setIsOpenAddCustomAmount(true)}>
                  + Custom Amount
                </Button>
              )}
            </Grid>
            <Grid item xs={12}>
              <Divider>Category Items</Divider>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth
                variant="filled"
                label="Search"
                placeholder="Search items..."
                onChange={(e) => setSearchKeywords(e.target.value)}
              />
            </Grid>
            {/* {
              categoryItems.length > 0 && (
                <Grid item xs={12}>
                  <OrderDetailsTable 
                    order={order}
                    items={categoryItems}
                    setItems={setCategoryItems}
                    handleUpdateItem={handleUpdateItem}
                    abilityToEdit
                    role={USER_ROLE.ADMIN}
                    showNotification={showNotification}
                  />
                </Grid>
              )
            } */}
            <Grid item textAlign="center" xs={12}>
              <OrderDetailsTable
                order={order}
                items={items}
                setItems={setItems}
                handleUpdateItem={handleUpdateItem}
                abilityToEdit
                role={USER_ROLE.ADMIN}
                showNotification={showNotification}
              />
            </Grid>
            <Grid
              container
              item
              textAlign="center"
              alignItems="center"
              rowGap={2}
              xs={12}
            >
              <Grid item xs={12}>
                <Typography fontWeight="bold" variant="h6">
                  NOTE
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  justifyContent="center"
                  gap={1}
                  alignItems="center"
                >
                  <Typography variant="subtitle1">
                    {order.note ? order.note : 'N/A'}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      color="error"
                      onClick={() => setIsOpenClearNote(true)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton onClick={() => setIsOpenEditNote(true)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                </Box>
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
        </BoxModal>
      </Modal>
    </>
  );
};

export default memo(OrderDetails, (prev, next) => {
  return (
    Object.is(prev.order, next.order) &&
    // Object.is(prev.handleUpdateItem, next.handleUpdateItem) &&
    prev.open === next.open
    // Object.is(prev.onClose, next.onClose)
  );
});
