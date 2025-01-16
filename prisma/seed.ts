import { PrismaClient } from '@prisma/client';
// import { generateUsers } from './userData';
// import { hash } from 'bcrypt';
// import { hash } from 'bcrypt';
// import { items } from './itemData';
// import { inputs } from './inputFieldData';

// const generateCurrentTime = () => {
//   const currentDate = new Date();
//   const dateString = moment(currentDate).format('YYYY-MM-DD');
//   const timeString = moment(currentDate).format('HH:mm:ss');

//   return `${timeString} ${dateString}`;
// };

export const YYYYMMDDFormat = (date: Date) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${month.toString().padStart(2, '0')}/${day
    .toString()
    .padStart(2, '0')}/${year.toString().padStart(2, '0')}`;

  return formattedDate;
};

export const generateListOfDateString = (startDate: Date, endDate: Date) => {
  const startDateString = YYYYMMDDFormat(startDate);
  const dates = [startDateString];
  const currentDate = startDate;
  currentDate.setDate(currentDate.getDate() + 1);

  while (currentDate <= endDate) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates.slice(0, dates.length);
};

const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };

async function main() {
  // const allScheduledOrderedItemsHasNoInventory = await prisma.orderedItems.findMany({
  //   where: {
  //     scheduledOrderId: {
  //       not: null
  //     },
  //     inventoryItemId: null
  //   }
  // });
  // const inventoryItems = await prisma.inventoryItem.findMany({
  //   include: {
  //     vendorItem: {
  //       include: {
  //         unit: true
  //       }
  //     }
  //   }
  // });
  // const newItems = allScheduledOrderedItemsHasNoInventory.map((item: any) => {
  //   let itemKey = item.name;
  //   let inventoryUnitIndex = 0;
  //   if (checkIsKorean(itemKey.split(' - ')[0])) {
  //     itemKey = itemKey.split(' - ')[1];
  //   } else {
  //     itemKey = itemKey.includes('KONGNAMUL')
  //       ? itemKey.split(' - ')[1]
  //       : itemKey;
  //   }
  //   if (itemKey === 'BEAN 24X1 LB') {
  //     itemKey = 'BEAN 1 LB';
  //     inventoryUnitIndex = 1;
  //   }
  //   if (itemKey === 'OYSTER MUSHROOM #1') {
  //     itemKey = 'NO. 1 OYSTER MUSHROOM 5 LB'
  //   }
  //   if (itemKey === 'OYSTER MUSHROOM #2') {
  //     itemKey = 'NO. 2 OYSTER MUSHROOM 5 LB'
  //   }
  //   if (itemKey === 'TARO 40 LB') {
  //     itemKey = 'TARO'
  //   }
  //   if (itemKey === 'BASIL BOX') {
  //     itemKey = 'BASIL';
  //     inventoryUnitIndex = 1;
  //   }
  //   if (itemKey === 'SOYA 24X1 LB') {
  //     itemKey = 'SOYA 1 LB';
  //     inventoryUnitIndex = 1;
  //   }
  //   if (itemKey === 'KOREAN SOYA 1X24') {
  //     itemKey = 'K. SOYA 1 LB';
  //     inventoryUnitIndex = 1;
  //   }
  //   if (itemKey === 'BEAN 5X1 LB') {
  //     itemKey = 'BEAN 1 LB';
  //     inventoryUnitIndex = 2;
  //   }
  //   if (itemKey === 'FRESH RICE NOODLE 1 LB') {
  //     itemKey = 'FRESH RICE NOODLES 1 LB';
  //     inventoryUnitIndex = 0;
  //   }
  //   if (itemKey === 'LAGRE EGG') {
  //     itemKey = 'LARGE EGG';
  //     inventoryUnitIndex = 0;
  //   }
  //   if (itemKey === 'WHITE MUSHROOM') {
  //     itemKey = 'No. 1 MUSHROOM WHITE 10 LB';
  //     inventoryUnitIndex = 0;
  //   }
  //   const sameNameInventory = inventoryItems.find((i: any) => {
  //     return i.name == itemKey;
  //   });
  //   if (!sameNameInventory) {
  //     console.error('Inventory item not found: ' + itemKey);
  //     return item;
  //   }
  //   console.log('Inventory item found: ' + item.name);
  //   return {
  //     name: item.name,
  //     price: item.price,
  //     quantity: item.quantity,
  //     scheduledOrderId: item.scheduledOrderId,
  //     inventoryItemId: sameNameInventory.id,
  //     inventoryUnitId: sameNameInventory.vendorItem[0].unit[inventoryUnitIndex].id,
  //   }
  // });
  // await prisma.orderedItems.deleteMany({
  //   where: {
  //     scheduledOrderId: {
  //       not: null
  //     },
  //     inventoryItemId: null
  //   }
  // });
  // await prisma.orderedItems.createMany({
  //   data: newItems
  // })
  // const users = await prisma.user.findMany({
  //   include: {
  //     scheduleOrders: true,
  //     routes: {
  //       include: {
  //         route: true,
  //       },
  //     },
  //   },
  // });
  // for (const user of users) {
  //   const userRoutes = user.routes.map((route) => {
  //     return route.route.day;
  //   });
  //   const conflictScheduleOrders = user.scheduleOrders.filter(
  //     (scheduleOrder) => {
  //       return !userRoutes.includes(scheduleOrder.day);
  //     },
  //   );
  //   if (conflictScheduleOrders.length > 0) {
  //     console.log({
  //       name: user.clientName,
  //       id: user.id,
  //       scheduleOrders: conflictScheduleOrders,
  //     });
  //     // const scheduleOrderIds = conflictScheduleOrders.map((scheduleOrder) => {
  //     //   return scheduleOrder.id;
  //     // });
  //     // await prisma.scheduleOrders.deleteMany({
  //     //   where: {
  //     //     id: {
  //     //       in: scheduleOrderIds
  //     //     }
  //     //   }
  //     // });
  //   }
  // }
  // const orders = await prisma.orders.findMany({
  //   where: {
  //     deliveryDate: '12/23/2024'
  //   },
  //   include: {
  //     items: true,
  //     user: true,
  //   }
  // });
  // const orderNoItems = orders.filter((order) => {
  //   return order.items.length === 0;
  // }).map((order) => {
  //   return order?.id
  // });
  //   where: {
  //     id: {
  //       in: orderNoItems
  //     }
  //   }
  // })
  // const startDate = new Date('2024-12-01');
  // const endDate = new Date('2024-12-31');
  // const decemberDayList = generateListOfDateString(startDate, endDate);
  // const ordersInDecember = await prisma.orders.findMany({
  //   where: {
  //     deliveryDate: {
  //       in: decemberDayList,
  //     },
  //   },
  //   include: {
  //     items: true,
  //     user: true,
  //   },
  // });
  // for (const order of ordersInDecember) {
  //   const actualTotalPrice = order.items.reduce((acc: number, item: any) => {
  //     return acc + item.price * item.quantity;
  //   }, 0);
  //   if (actualTotalPrice.toFixed(2) !== order.totalPrice.toFixed(2)) {
  //     // await prisma.orders.update({
  //     //     id: order.id
  //     //   },
  //     //   data: {
  //     //     totalPrice: actualTotalPrice,
  //     //     subTotal: actualTotalPrice
  //     //   }
  //     // })
  //     console.log({
  //       id: order.id,
  //       deliveryDate: order.deliveryDate,
  //       clientName: order?.user?.clientName,
  //       clientId: order?.user?.clientId,
  //       actualTotalPrice,
  //       orderTotalPrice: order.totalPrice,
  //     });
  //   }
  // }
  // const orders = await prisma.orders.findMany({
  //   where: {
  //     deliveryDate: '01/03/2025'
  //   },
  //   include: {
  //     items: true,
  //     user: {
  //       include: {
  //         category: {
  //           include: {
  //             items: true
  //           }
  //         }
  //       }
  //     },
  //   }
  // });
  // for (const order of orders) {
  //   if (order.items.length !== order.user?.category.items.length) {
  //     console.log({
  //       id: order.id,
  //       deliveryDate: order.deliveryDate,
  //       clientName: order?.user?.clientName,
  //       clientId: order?.user?.clientId,
  //     });
  //     // const newItems = order.user?.category.items.map((item: any) => {
  //     //   const itemInOrder = order.items.find((orderItem: any) => {
  //     //     return orderItem.name === item.name && orderItem;
  //     //   })
  //     // });
  //   }
  // }
  /**CHECK IF SCHEDULED ORDERS ITEMS ARE MATCH WITH CATEGORY */
  // const scheduleOrderItems = await prisma.orderedItems.findMany({
  //   where: {
  //     scheduledOrderId: {
  //       not: null
  //     }
  //   },
  //   include: {
  //     ScheduleOrders: {
  //       include: {
  //         user: true
  //       }
  //     }
  //   }
  // });
  // const categoryItems = await prisma.item.findMany({});
  // for (const scheduleOrderItem of scheduleOrderItems) {
  //   const categoryItem = categoryItems.find((categoryItem: any) => {
  //     return categoryItem.inventoryItemId === scheduleOrderItem.inventoryItemId && categoryItem.categoryId === scheduleOrderItem?.ScheduleOrders?.user.categoryId;
  //   })
  //     if (!categoryItem) {
  //       // console.log({
  //       //   scheduleOrderId: scheduleOrderItem.id,
  //       //   name: scheduleOrderItem.name,
  //       //   clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName
  //       // });
  //       continue;
  //     };
  //     // if (scheduleOrderItem.price !== categoryItem.price) {
  //     //   console.log({
  //     //     clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
  //     //     name: scheduleOrderItem.name,
  //     //     scheduleOrderId: scheduleOrderItem.id,
  //     //     day: scheduleOrderItem?.ScheduleOrders?.day,
  //     //     price: scheduleOrderItem.price,
  //     //     categoryPrice: categoryItem.price
  //     //   }, 'price');
  //     // }
  //     if (scheduleOrderItem.isShowDiscount !== categoryItem.isShowDiscount) {
  //       console.log({
  //         clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
  //         name: scheduleOrderItem.name,
  //         scheduleOrderId: scheduleOrderItem.id,
  //         day: scheduleOrderItem?.ScheduleOrders?.day,
  //         isShowDiscount: scheduleOrderItem.isShowDiscount,
  //         categoryIsShowDiscount: categoryItem.isShowDiscount
  //       }, 'isShowDiscount');
  //       // await prisma.orderedItems.update({
  //       //   where: {
  //       //     id: scheduleOrderItem.id
  //       //   },
  //       //   data: {
  //       //     isShowDiscount: categoryItem.isShowDiscount,
  //       //     prevPrice: categoryItem.prevPrice
  //       //   }
  //       // });
  //       continue;
  //     }
  //     if (scheduleOrderItem.prevPrice !== categoryItem.prevPrice) {
  //       console.log({
  //         clientName: scheduleOrderItem?.ScheduleOrders?.user.clientName,
  //         name: scheduleOrderItem.name,
  //         scheduleOrderId: scheduleOrderItem.id,
  //         day: scheduleOrderItem?.ScheduleOrders?.day,
  //         prevPrice: scheduleOrderItem.prevPrice,
  //         categoryPrevPrice: categoryItem.prevPrice
  //       }, 'prevPrice');
  //       // await prisma.orderedItems.update({
  //       //   where: {
  //       //     id: scheduleOrderItem.id
  //       //   },
  //       //   data: {
  //       //     isShowDiscount: categoryItem.isShowDiscount,
  //       //     prevPrice: categoryItem.prevPrice
  //       //   }
  //       // });
  //       continue;
  //     }
  // }
  // CHECK IF SCHEDULED ORDERS TOTAL PRICE IS CORRECT
  // const scheduleOrders = await prisma.scheduleOrders.findMany({
  //   include: {
  //     user: true,
  //     items: true,
  //   }
  // });
  // for (const scheduleOrder of scheduleOrders) {
  //   const actualTotalPrice = scheduleOrder.items.reduce((acc: number, item: any) => {
  //     return acc + (item.price * item.quantity);
  //   }, 0);
  //   if (scheduleOrder.totalPrice.toFixed(2) !== actualTotalPrice.toFixed(2)) {
  //     console.log({
  //       id: scheduleOrder.id,
  //       clientName: scheduleOrder.user.clientName,
  //       clientId: scheduleOrder.user.clientId,
  //       day: scheduleOrder.day,
  //       totalPrice: scheduleOrder.totalPrice,
  //       actualTotalPrice
  //     })
  //   }
  // }
  // const scheduledOrders = await prisma.scheduleOrders.findMany({
  //   include: {
  //     user: true,
  //     items: true,
  //   }
  // });
  // const itemsSameName = [];
  // const deletedIds = [];
  // for (const scheduledOrder of scheduledOrders) {
  //   const items = [...scheduledOrder.items];
  //   for (const item of items) {
  //     const sameItemInOneOrder = scheduledOrder.items.filter((sItem) => {
  //       return item.name === sItem.name && item.inventoryItemId == sItem.inventoryItemId
  //     });
  //     if (sameItemInOneOrder.length === 2) {
  //       itemsSameName.push(item);
  //       deletedIds.push(sameItemInOneOrder[1].id);
  //       console.log({
  //         clientName: scheduledOrder.user.clientName,
  //         orderId: scheduledOrder.id,
  //         day: scheduledOrder.day,
  //         name: item.name,
  //         inventoryItemId: item.inventoryItemId,
  //         // sameInventoryItemId: sameItemInOneOrder.inventoryItemId
  //       });
  //       break;
  //     }
  //   }
  // }
  // console.log(itemsSameName.length);
  // await prisma.orderedItems.deleteMany({
  //   where: {
  //     id: {
  //       in: deletedIds
  //     }
  //   }
  // });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
