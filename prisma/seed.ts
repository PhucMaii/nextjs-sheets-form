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
  // const startDate = new Date('2024-11-01');
  // const endDate = new Date('2024-12-01');
  // const decemberDayList = generateListOfDateString(startDate, endDate);
  // const ordersInDecember = await prisma.orders.findMany({
  //   where: {
  //     deliveryDate: '12/23/2024'
  //   },
  //   include: {
  //     items: true,
  //     user: true,
  //   }
  // });
  // for (const order of ordersInDecember) {
  //   const actualTotalPrice = order.items.reduce((acc: number, item: any) => {
  //     return acc + item.price * item.quantity;
  //   }, 0);
  //   if (actualTotalPrice.toFixed(2) !== order.totalPrice.toFixed(2)) {
  //     // await prisma.orders.update({
  //     //   where: {
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

  const orders = await prisma.orders.findMany({
    where: {
      orderTime: {
        not: '23:39:32 2024-12-22',
      },
      deliveryDate: '12/31/2024',
    },
  });

  console.log(orders, 'orders');

  // const scheduledOrders = await prisma.scheduleOrders.findMany({
  //   include: {
  //     items: true,
  //     user: {
  //       include: {
  //         category: {
  //           include: {
  //             items: true,
  //           }
  //         }
  //       }
  //     }
  //   },
  // });

  // for (const scheduledOrder of scheduledOrders) {
  //   console.log({id: scheduledOrder.id, clientName: scheduledOrder.user.clientName, day: scheduledOrder.day})
  //   const newItems = scheduledOrder.user.category.items.map((item) => {
  //     const previousItem = scheduledOrder.items.find((prevItem) => {
  //       return prevItem.name === item.name;
  //     });

  //     return {
  //       name: item.name,
  //       price: item.price,
  //       quantity: previousItem?.quantity || 0,
  //       inventoryItemId: item?.inventoryItemId,
  //       inventoryUnitId: item?.inventoryUnitId,
  //       scheduledOrderId: scheduledOrder.id
  //     }
  //   });

  //   await prisma.orderedItems.deleteMany({
  //     where: {
  //       scheduledOrderId: scheduledOrder.id
  //     }
  //   });

  //   await prisma.orderedItems.createMany({
  //     data: newItems,
  //   });
  // }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
