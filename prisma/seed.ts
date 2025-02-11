import { PrismaClient } from '@prisma/client';
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
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
