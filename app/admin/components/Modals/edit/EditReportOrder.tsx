import {
  AlertColor,
  // Button,
  Divider,
  Modal,
} from '@mui/material';
import React from 'react';
import { BoxModal } from '../styled';
import { Order } from '../../../orders/page';
import {} from '@/app/utils/time';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import axios from 'axios';
import { ModalProps } from '../type';
import ModalHead from '@/app/lib/ModalHead';
import OrderView, { ORDER_USAGE_PURPOSE } from '@/app/components/OrderView';
import { SWRFetchData } from '@/app/utils/db';

interface PropTypes extends ModalProps {
  order: Order;
  // handleUpdateOrderUI: (updatedOrder: Order) => void;
  onUpdateOrderUI?: (updatedOrder: Order) => void;
  showNotification: (type: AlertColor, message: string) => void;
  mutateOrders: any;
}

const EditReportOrder = ({
  order,
  // handleUpdateOrderUI,
  showNotification,
  open,
  onClose,
  mutateOrders,
  onUpdateOrderUI,
}: PropTypes) => {
  const [sellingItems] = SWRFetchData(`${API_URL.ITEM}?userId=${order.userId}`);

  // useEffect(() => {
  //   if (order) {
  //     setOrderData(() => ({
  //       deliveryDate: order.deliveryDate,
  //       status: order.status,
  //       isAffectInventory: order.isAffectInventory,
  //     }));
  //     setItemList(order.items);
  //     // setUpdatedDate(order.deliveryDate);
  //     // setStatus(order.status);
  //   }
  // }, [order]);

  // const onUpdateChange = (e: any) => {
  //   const formattedDate: string = formatDateChanged(e);
  //   setOrderData((prevState: any) => ({
  //     ...prevState,
  //     deliveryDate: formattedDate,
  //   }));
  // };

  // const handleChangeItem = (e: any, targetItem: Item, keyChange: string) => {
  //   e.preventDefault();
  //   const newItemList = itemList.map((item: Item) => {
  //     if (item.id === targetItem.id) {
  //       if (keyChange === 'quantity') {
  //         const totalPrice = item.price * +e.target.value;
  //         return { ...item, quantity: +e.target.value, totalPrice };
  //       }
  //       if (keyChange === 'price') {
  //         const totalPrice = item.quantity * +e.target.value;
  //         return { ...item, price: +e.target.value, totalPrice };
  //       }
  //       return item;
  //     }

  //     return item;
  //   });

  //   setItemList(newItemList);
  // };

  // const calculateNewTotalPrice = () => {
  //   const totalPrice = itemList.reduce((acc: number, cV: any) => {
  //     return acc + cV.totalPrice;
  //   }, 0);

  //   return totalPrice;
  // };

  // const onAvoidInventory = async (e: any) => {
  //   setIsUpdatingAvoidInventory(true);
  //   try {
  //     setOrderData((prevState: any) => ({
  //       ...prevState,
  //       isAffectInventory: e.target.checked,
  //     }));
  //     const response = await axios.put(
  //       `${API_URL.ADMIN}/orders/isAffectInventory`,
  //       {
  //         id: order.id,
  //         isAffectInventory: e.target.checked,
  //       },
  //     );

  //     if (response.data.error) {
  //       showNotification('error', response.data.error);
  //       setIsUpdatingAvoidInventory(false);
  //       return;
  //     }

  //     showNotification('success', response.data.message);
  //     setIsUpdatingAvoidInventory(false);
  //   } catch (error: any) {
  //     console.log('Internal Server Error: ', error.response.data.error);
  //     showNotification(
  //       'error',
  //       'Internal Server Error: ' + error.response.data.error,
  //     );
  //     setIsUpdatingAvoidInventory(false);
  //   }
  // };

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

  //     setItemList((prevState: any) => {
  //       return [...prevState, response.data.data];
  //     });
  //     showNotification('success', response.data.message);
  //   } catch (error: any) {
  //     console.log('There was an error: ', error);
  //     showNotification(
  //       'error',
  //       'Fail to update item: ' + error?.response?.data?.error,
  //     );
  //   }
  // };

  const onUpdateItem = async (orderParam: Order) => {
    try {
      const response = await axios.put(API_URL.ORDERED_ITEMS, {
        updatedItems: orderParam.items,
        orderId: order.id,
        note: orderParam.note,
        deliveryDate: orderParam.deliveryDate,
      });

      if (response.data.error) {
        showNotification('error', response.data.error);
        return;
      }

      if (onUpdateOrderUI) {
        onUpdateOrderUI(response.data.data);
      }
      mutateOrders();
      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log('There was an error: ', error);
      showNotification('error', 'Fail to update item: ' + error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <BoxModal
        maxHeight="80vh"
        overflow="scroll"
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <ModalHead
          onClose={onClose}
          heading="Edit Order"
          buttonLabel="UPDATE"
          onlyHeading
          onClick={() => {}}
          buttonProps={{}}
        />

        <Divider />

        <OrderView
          items={sellingItems?.data || []}
          defaultOrderedItems={order.items}
          defaultOrder={order}
          purpose={ORDER_USAGE_PURPOSE.ITEM}
          onSubmit={onUpdateItem}
          isModal
          role={USER_ROLE.ADMIN}
          clientName={order?.user?.clientName}
        />
      </BoxModal>
    </Modal>
  );

  // return (
  //   <>
  //     <DeleteModal
  //       open={deleteItemProps.open}
  //       handleCloseModal={() =>
  //         setDeleteItemProps((prevState: any) => ({
  //           ...prevState,
  //           open: false,
  //         }))
  //       }
  //       targetObj={deleteItemProps.targetObj}
  //       handleDelete={onDeleteCustomAmount}
  //       showTargetObj={deleteItemProps?.targetObj?.name}
  //     />
  //     <AddCustomAmount
  //       open={isOpenAddCustomAmount}
  //       onClose={() => setIsOpenAddCustomAmount(false)}
  //       // addCustomAmount={handleAddCustomAmount}
  //       onUpdateUI={(customAmount: any) =>
  //         setItemList((prevState: any) => [...prevState, customAmount])
  //       }
  //       orderId={order.id}
  //       showNotification={showNotification}
  //     />
  //     <AddVendor
  //       showNotification={showNotification}
  //       open={isOpenAddVendor}
  //       onClose={() => setIsOpenAddVendor(false)}
  //     />
  //     <Modal open={open} onClose={onClose}>
  //       <BoxModal display="flex" flexDirection="column" gap={2}>
  //         <Box
  //           display="flex"
  //           justifyContent="space-between"
  //           alignItems="center"
  //         >
  //           <Typography variant="h4">Edit Order {order.id}</Typography>
  //           <FormControlLabel
  //             control={
  //               <Switch
  //                 checked={orderData?.isAffectInventory}
  //                 onChange={onAvoidInventory}
  //               />
  //             }
  //             label={
  //               isUpdatingAvoidInventory ? 'Updating...' : 'Affect Inventory'
  //             }
  //           />
  //         </Box>
  //         <Divider />
  //         <Box overflow="auto" maxHeight="70vh">
  //           <Grid container rowGap={2}>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6">Delivery Date</Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <FormControl fullWidth>
  //                 <LocalizationProvider dateAdapter={AdapterDayjs}>
  //                   <DatePicker
  //                     value={dayjs(orderData.deliveryDate)}
  //                     onChange={(e: any) => onUpdateChange(e)}
  //                     sx={{
  //                       width: '100%',
  //                       height: '0.1%',
  //                       borderRadius: 2,
  //                     }}
  //                     shouldDisableDate={disableChristmasAndNewYear}
  //                   />
  //                 </LocalizationProvider>
  //               </FormControl>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <Typography variant="h6">Status</Typography>
  //             </Grid>
  //             <Grid item xs={12} md={6}>
  //               <FormControl fullWidth>
  //                 <InputLabel id="select-status">Status</InputLabel>
  //                 <Select
  //                   labelId="select-status"
  //                   value={orderData.status}
  //                   label="Status"
  //                   onChange={(e) =>
  //                     setOrderData((prevState: any) => ({
  //                       ...prevState,
  //                       status: e.target.value as ORDER_STATUS,
  //                     }))
  //                   }
  //                 >
  //                   <MenuItem value={ORDER_STATUS.COMPLETED}>
  //                     Completed
  //                   </MenuItem>
  //                   <MenuItem value={ORDER_STATUS.DELIVERED}>
  //                     Delivered
  //                   </MenuItem>
  //                   <MenuItem value={ORDER_STATUS.INCOMPLETED}>
  //                     Incompleted
  //                   </MenuItem>
  //                   <MenuItem value={ORDER_STATUS.VOID}>Void</MenuItem>
  //                 </Select>
  //               </FormControl>
  //             </Grid>
  //             <Grid item xs={12} textAlign="right">
  //               <LoadingButton
  //                 variant="contained"
  //                 disabled={itemList.length === 0}
  //                 loading={isSubmitting}
  //                 onClick={handleUpdateOrder}
  //               >
  //                 SAVE
  //               </LoadingButton>
  //             </Grid>
  //           </Grid>
  //           {/* <Divider textAlign="center" sx={{ my: 3 }}>
  //             Add items
  //           </Divider> */}
  //           <Grid container spacing={3} mb={2}>
  //             <Grid item xs={12}>
  //               <Divider>Items</Divider>
  //             </Grid>
  //             <Grid item xs={12} textAlign="right">
  //               <Button onClick={() => setIsOpenAddCustomAmount(true)}>
  //                 + Custom Amount
  //               </Button>
  //             </Grid>
  //             {updateOption === UpdateOption.CREATE && (
  //               <>
  //                 <Grid container item xs={12} rowGap={1}>
  //                   <Typography variant="h6" fontWeight="bold">
  //                     New Category Name
  //                   </Typography>
  //                   <TextField
  //                     fullWidth
  //                     label="New category name"
  //                     value={newCategoryName}
  //                     onChange={(e) => setNewCategoryName(e.target.value)}
  //                   />
  //                 </Grid>
  //               </>
  //             )}
  //             {itemList.length > 0 &&
  //               itemList.map((item: Item, index) => {
  //                 return (
  //                   <Fragment key={index}>
  //                     <Grid item xs={12} fontWeight="bold">
  //                       <Box display="flex" alignItems="center" gap={1}>
  //                         <Typography variant="h6" fontWeight="bold">
  //                           {item.name}
  //                         </Typography>
  //                         {item?.isCustomAmount || !item?.inventoryItemId ? (
  //                           <IconButton
  //                             onClick={() =>
  //                               setDeleteItemProps({
  //                                 open: true,
  //                                 targetObj: item,
  //                               })
  //                             }
  //                           >
  //                             <RemoveCircleIcon sx={{ color: errorColor }} />
  //                           </IconButton>
  //                         ) : null}
  //                       </Box>
  //                     </Grid>
  //                     <Grid item container columnSpacing={2}>
  //                       <Grid item xs={6} textAlign="right">
  //                         <TextField
  //                           fullWidth
  //                           label="Unit Price ($)"
  //                           value={item.price}
  //                           onChange={(e) => handleChangeItem(e, item, 'price')}
  //                           type="number"
  //                           inputProps={{ min: 0 }}
  //                         />
  //                       </Grid>
  //                       <Grid item xs={6}>
  //                         <TextField
  //                           fullWidth
  //                           label="Quantity"
  //                           value={item.quantity}
  //                           onChange={(e) =>
  //                             handleChangeItem(e, item, 'quantity')
  //                           }
  //                           type="number"
  //                           inputProps={{ min: 0 }}
  //                         />
  //                       </Grid>
  //                     </Grid>
  //                   </Fragment>
  //                 );
  //               })}
  //             <Grid item xs={12} textAlign="right">
  //               <LoadingButton
  //                 variant="contained"
  //                 onClick={onUpdateItem}
  //                 loading={isSubmitting}
  //               >
  //                 Save
  //               </LoadingButton>
  //             </Grid>
  //           </Grid>
  //         </Box>
  //       </BoxModal>
  //     </Modal>
  //   </>
  // );
};

export default EditReportOrder;
