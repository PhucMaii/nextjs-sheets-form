import { PrismaClient } from '@prisma/client';

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
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };

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
        },
      },
    },
  });

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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
