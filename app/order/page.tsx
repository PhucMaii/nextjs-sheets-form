'use client';
import React, { useEffect, useState } from 'react';
import LoadingComponent from '@/app/components/LoadingComponent/LoadingComponent';
import axios from 'axios';
import { API_URL, USER_ROLE } from '@/app/utils/enum';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import moment from 'moment';
import { limitOrderHour } from '../lib/constant';
import { Order } from '../admin/orders/page';
import Sidebar from '../components/Sidebar';
import useNotification from '@/hooks/useNotification';
import { SWRFetchData } from '../utils/db';
import OrderView, { ORDER_USAGE_PURPOSE } from '../components/OrderView';
import NotificationPopup from '../admin/components/Notification';
import { useRouter } from 'next/navigation';

export default function OrderForm() {
  const [itemList, setItemList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const { showNotification, notification, closeNotification } =
    useNotification();

  let today: any = dayjs();
  if (today.$H >= limitOrderHour) {
    today = today.add(1, 'day');
  }

  const minDate = today.startOf('day');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [items, _mutate, isValidating] = SWRFetchData(API_URL.CLIENT_ITEM);

  useEffect(() => {
    if (!items && isValidating) {
      setIsLoading(true);
    } else {
      initializeItems();
      setIsLoading(false);
    }
  }, [items]);

  // useEffect(() => {
  //   if (lastOrder) {
  //     setIsOverrideOrderOpen(true);
  //   }
  // }, [lastOrder]);

  // Get list of items to render input field
  const initializeItems = () => {
    const formatItems = items.data.items.map((item: any) => {
      return { ...item, quantity: 0 };
    });

    setItemList(formatItems);
  };

  const onSubmit = async (order: Order) => {
    // Check if items are selected
    if (order.items.length === 0) {
      showNotification('error', 'Please select at least one item');
      return;
    }

    // Check is delivery date valid
    const deliveryDateObj = dayjs(order.deliveryDate);
    if (
      deliveryDateObj.isBefore(minDate) ||
      (deliveryDateObj.date() === 1 && deliveryDateObj.month() === 0)
    ) {
      showNotification('error', 'Delivery date is not valid');
      return;
    }

    try {
      const currentDate = new Date();
      const dateString = moment(currentDate).format('YYYY-MM-DD');
      const timeString = moment(currentDate).format('HH:mm:ss');

      // Format data to have the same structure as backend
      const submittedData: any = {
        deliveryDate: order.deliveryDate,
        note: order.note,
        createdAt: `${timeString} ${dateString}`,
        items: order.items,
        createdBy: USER_ROLE.CLIENT,
      };

      // for (const item of itemList) {
      //   submittedData = { ...submittedData, [item.name]: item.quantity };
      // }

      const response = await axios.post(API_URL.IMPORT_SHEETS, submittedData);

      // SHOULD BE /user/overview after website is done
      router.push('/');

      showNotification('success', response.data.message);
    } catch (error: any) {
      console.log(error);
      showNotification('error', error.response.data.error);
    }
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="flex flex-col gap-8 justify-center items-center pt-8 h-screen">
          <LoadingComponent />
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <NotificationPopup
        notification={notification}
        onClose={() => {
          setTimeout(() => {
            closeNotification();
          }, 3000);
        }}
      />
      <Box pb={6}>
        <OrderView
          onSubmit={onSubmit}
          items={itemList}
          purpose={ORDER_USAGE_PURPOSE.ORDER}
          role={USER_ROLE.CLIENT}
        />
      </Box>
    </Sidebar>
  );

  //   return (
  //     <FadeIn>
  //       <Sidebar>
  //         <SearchItem
  //           open={isOpenSearch}
  //           onClose={() => setIsOpenSearch(false)}
  //           items={itemList}
  //           setItems={setItemList}
  //         />
  //         <NotificationPopup
  //           notification={notification}
  //           onClose={() => {
  //             setTimeout(() => {
  //               closeNotification();
  //             }, 3000);
  //           }}
  //           anchorOrigin={{
  //             vertical: 'top',
  //             horizontal: 'right',
  //           }}
  //         />
  //         <ChangePasswordModal
  //           isOpen={isOpenSecurityModal}
  //           onClose={() => setIsOpenSecurityModal(false)}
  //         />
  //         {lastOrder && (
  //           <OverrideOrder
  //             open={isOverrideOrderOpen}
  //             onClose={() => setIsOverrideOrderOpen(false)}
  //             currentItems={itemList}
  //             currentNote={note}
  //             lastOrder={lastOrder}
  //             deliveryDate={deliveryDate}
  //             showNotification={showNotification}
  //           />
  //         )}
  //         {unavailableRange && (
  //           <OrderOnVacationModal
  //             clientName={clientName}
  //             open={isOrderOnVacationOpen}
  //             onClose={() => setIsOrderOnVacationOpen(false)}
  //             startDate={new Date(unavailableRange[0])}
  //             endDate={new Date(unavailableRange[1])}
  //             handleContinueOrder={(e: any) => onSubmit(e, false)}
  //           />
  //         )}
  //         <div className="w-full mx-auto pb-6">
  //           {smDown && <Navbar />}
  //           {/* <form className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 overflow-scroll"> */}
  //           <Box
  //             sx={{ position: 'relative', backgroundColor: 'white' }}
  //             borderRadius={2}
  //             px={4}
  //             py={2}
  //           >
  //             {/* <h4 className="text-center font-bold text-4xl px-8 mb-8">
  //               {clientName}
  //             </h4> */}
  //             <Grid container alignItems="center" rowGap={2} mb={2}>
  //               <Grid item xs={2}></Grid>
  //               <Grid item xs={8}>
  //                 <Typography variant="h4" textAlign="center">
  //                   {clientName}
  //                 </Typography>
  //               </Grid>
  //               <Grid item xs={2} textAlign="right">
  //                 <IconButton size="large" onClick={() => setIsOpenSearch(true)}>
  //                   <SearchIcon fontSize="large" />
  //                 </IconButton>
  //               </Grid>
  //             </Grid>
  //             <Box mb={4}>
  //               <Typography fontWeight="bold" variant="subtitle1" color="error">
  //                 DELIVERY DATE
  //               </Typography>
  //               <LocalizationProvider dateAdapter={AdapterDayjs}>
  //                 <DatePicker
  //                   disablePast
  //                   minDate={minDate}
  //                   value={dayjs(deliveryDate)}
  //                   onChange={onDateChange}
  //                   sx={{ width: '100%' }}
  //                   shouldDisableDate={disableChristmasAndNewYear}
  //                 />
  //               </LocalizationProvider>
  //             </Box>
  //             <Box display="flex" flexDirection="column" gap={4}>
  //               {itemList.length > 0 &&
  //                 itemList.map((item: any, index: number) => {
  //                   return (
  //                     <Box
  //                       key={index}
  //                       display="flex"
  //                       flexDirection="column"
  //                       gap={1}
  //                     >
  //                       <SellingItemName item={item} />
  //                       <TextField
  //                         type="number"
  //                         value={item.quantity}
  //                         onChange={(e) => onChangeItem(e, item)}
  //                         placeholder={`Enter ${item.name} here...`}
  //                         disabled={!item.availability}
  //                         inputProps={{ min: 0 }}
  //                       />
  //                     </Box>
  //                   );
  //                 })}
  //               <Box display="flex" flexDirection="column" gap={1}>
  //                 <Typography variant="subtitle1">NOTE</Typography>
  //                 <TextField
  //                   multiline
  //                   maxRows={4}
  //                   value={note}
  //                   className="border-neutral-400 h-full mb-4"
  //                   onChange={(e) => setNote(e.target.value)}
  //                   placeholder="Writing your note here..."
  //                 />
  //               </Box>
  //             </Box>

  //             <Box display="flex" justifyContent={'center'}>
  //               <LoadingButton
  //                 variant="contained"
  //                 onClick={onSubmit}
  //                 type="submit"
  //                 loading={isButtonLoading}
  //                 fullWidth
  //                 // sx={{ mt: 2}}
  //               >
  //                 Submit
  //               </LoadingButton>
  //             </Box>
  //             {/* </form> */}
  //           </Box>
  //         </div>
  //       </Sidebar>
  //     </FadeIn>
  //   );
}
