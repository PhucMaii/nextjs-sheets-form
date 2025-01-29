import { ScheduledOrder } from '@/app/utils/type';
import { PrismaClient, UserRoute } from '@prisma/client';
const prisma = new PrismaClient();
// const checkIsKorean = (text: string) => {
//   // const koreanRange = /^[\uAC00-\uD7AF]+$/;
//   const koreanRange = /[\uAC00-\uD7AF]/;
//   return koreanRange.test(text);
// };
async function main() {
  const routes = await prisma.route.findMany({
    include: {
      clients: {
        include: {
          user: {
            include: {
              scheduleOrders: true,
            }
          },
        }
      },
    }
  });

  const indexPos = [];

  for (const route of routes) {
    const scheduledOrders = route.clients.map((client: UserRoute | any) => {
      if (client.user.scheduleOrders.length === 0) {
        return null;
      }
      const routePreOrder = client.user.scheduleOrders.find((scheduledOrder: ScheduledOrder) => {
        return scheduledOrder.day === route.day;
      });

      return routePreOrder;
    }).sort((orderA: ScheduledOrder, orderB: ScheduledOrder) => orderA.id - orderB.id);

    for (let i = 0; i < scheduledOrders.length; i++) {
      indexPos.push({
        index: i,
        scheduledOrderId: scheduledOrders[i].id
      })
    }
  }

  await prisma.positionIndex.createMany({
    data: indexPos
  })

}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    // process.exit(1);
  });
