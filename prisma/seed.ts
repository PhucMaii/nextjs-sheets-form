import { PrismaClient } from '@prisma/client';
<<<<<<< HEAD

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

  while (currentDate.getTime() <= endDate.getTime()) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
=======
>>>>>>> 112b8737d51913171bdb4242a1f033bf93213fd5
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };

<<<<<<< HEAD
export const normalizeDate = (date: Date | string) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

async function main() {
  // for (const order of satOrders) {
  //   const orderDeliveryDate: Date = normalizeDate(order.deliveryDate);
  //   const orderDayIndex = orderDeliveryDate.getDay();
  //   const orderDay = days[orderDayIndex];
  //   const orderRoute = order.user.routes.find((route: any) => {
  //     return route.route.day === orderDay;
  //   });

  //   const boardWithSameDriverId = satBoards.find((board: any) => {
  //     return board.driverId === orderRoute?.route?.driver?.id;
  //   });

  //   if (boardWithSameDriverId) {
  //     await prisma.orders.update({
  //       where: {
  //         id: order.id,
  //       },
  //       data: {
  //         codBoardId: boardWithSameDriverId.id,
  //       }
  //     });
  //   }

  //   console.log({
  //     driver: orderRoute?.route?.driver?.name,
  //     driverId: orderRoute?.route.driver.id,
  //     clientName: order.user.clientName,
  //   })
  // }

  const getTodayDate = (
    dateStyle: 'short' | 'long' | 'full' | 'medium' | undefined = 'short',
    timeStyle: 'short' | 'long' = 'long',
  ) => {
    const pstDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle,
      timeStyle,
      // timeStyle,
    }).format(new Date());

    const date = pstDate.split(',')[0];
    const dateSplitted = date.split('/');

    const month = dateSplitted[0].padStart(2, '0');
    const day = dateSplitted[1].padStart(2, '0');
    const year = dateSplitted[2];

    return { date: `${month}/${day}/20${year}`, time: pstDate.split(',')[1] };
  };

  const startDate = new Date('2024-12-02');
  const endDate = getTodayDate();
  const endDateFormatted = new Date(`${endDate.date} ${endDate.time}`);
  endDateFormatted.setDate(endDateFormatted.getDate() + 1);
  const decemberDayList = generateListOfDateString(startDate, endDateFormatted);

  const jalapenoOrders = await prisma.orderedItems.findMany({
    where: {
      name: {
        contains: 'jala',
      },
      quantity: {
        gt: 0,
      },
      Orders: {
        deliveryDate: {
          in: decemberDayList,
=======
export const generateCostAndProfit = async (orderedItemId: number) => {
  try {
    const prisma = new PrismaClient();

    const existingItem = await prisma.orderedItems.findUnique({
      where: {
        id: orderedItemId,
      },
      include: {
        fifo: {
          include: {
            vendorItem: {
              include: {
                unit: true,
              },
            },
          },
>>>>>>> 112b8737d51913171bdb4242a1f033bf93213fd5
        },
      },
    });

    if (!existingItem) {
      throw new Error(
        'Ordered item id not provided in generate cost and profit',
      );
    }

    let cost = existingItem?.cost;

    if (!cost) {
      cost = existingItem?.fifo?.price
        ? existingItem.fifo.price
        : existingItem.fifo?.vendorItem?.unit?.find(
            (unit: any) => unit.ratio === 1,
          )?.unitPrice || 0;
    }

    return { cost, profit: existingItem.price - cost };
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    throw new Error('Fail to generate cost and profit: ', error);
  }
};

export const normalizeDate = (date: Date | string) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const getTodayDate = (
  dateStyle: 'short' | 'long' | 'full' | 'medium' | undefined = 'short',
  timeStyle: 'short' | 'long' = 'long',
) => {
  const pstDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle,
    timeStyle,
    // timeStyle,
  }).format(new Date());

  const date = pstDate.split(',')[0];
  const dateSplitted = date.split('/');

  const month = dateSplitted[0].padStart(2, '0');
  const day = dateSplitted[1].padStart(2, '0');
  const year = dateSplitted[2];

  return { date: `${month}/${day}/20${year}`, time: pstDate.split(',')[1] };
};

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

  while (currentDate.getTime() <= endDate.getTime()) {
    // dates.push(currentDate);
    const currentDateString = YYYYMMDDFormat(currentDate);
    dates.push(currentDateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

async function main() {
  // const startDate = new Date('2025-02-01');
  // const endDate = getTodayDate();
  // const endDateFormatted = new Date(`${endDate.date} ${endDate.time}`);
  // endDateFormatted.setDate(endDateFormatted.getDate() + 1);
  // const decemberDayList = generateListOfDateString(startDate, endDateFormatted);

  const orderedItems = await prisma.orderedItems.findMany({
    where: {
      orderId: {
        not: null,
      },
      Orders: {
        deliveryDate: {
          in: [
            '02/13/2025',
            '02/14/2025',
            '02/15/2025',
            '02/16/2025',
            '02/17/2025',
            '02/18/2025',
            '02/19/2025',
            '02/20/2025',
          ],
        },
      },
      quantity: {
        gt: 0,
      },
    },
    include: {
      Orders: {
        include: {
          user: true,
        },
      },
    },
  });

<<<<<<< HEAD
  const orderIds: any = jalapenoOrders.map((order) => {
    return order.orderId;
  });

  const orders = await prisma.orders.findMany({
    where: {
      id: {
        in: orderIds,
      },
    },
  });

  console.log(orders, 'jalapeno orders');
=======
  for (const item of orderedItems) {
    console.log({
      name: item.name,
      orderId: item.orderId,
      clientName: item?.Orders?.user?.clientName,
      deliveryDate: item?.Orders?.deliveryDate,
    });
    const { cost } = await generateCostAndProfit(item.id);

    await prisma.orderedItems.update({
      where: {
        id: item.id,
      },
      data: {
        cost,
        profit: item.price - cost,
      },
    });
  }

  console.log(orderedItems.length);
>>>>>>> 112b8737d51913171bdb4242a1f033bf93213fd5
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });

//{
//   orderId: 34722,
//   customAmount: {
//     name: 'MEDIUM FIRM TOFU',
//     price: 30,
//     quantity: 2,
//     units: [ [Object] ],
//     inventoryUnit: {
//       id: 120,
//       vendorItemId: 96,
//       unit: 'cases',
//       unitPrice: 25,
//       ratio: 1,
//       createdAt: '18:06:10 2025-01-05',
//       createdBy: 'Admin - Bao Bao'
//     },
//     isCustomAmount: true,
//     inventoryItem: {
//       id: 53,
//       name: 'MEDIUM FIRM TOFU',
//       hasPST: null,
//       hasGST: null,
//       createdAt: '09:58:44 2024-11-09',
//       createdBy: 'Admin - Bao Bao',
//       fifo: [Array],
//       vendorItem: [Array],
//       totalValue: 142.2,
//       quantity: 6,
//       stockStatus: 'Low Stock'
//     },
//     inventoryItemId: 53,
//     inventoryUnitId: 120
//   }
// }
