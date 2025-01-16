import { generateListOfDateString } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';

describe('Check for incorrect orders', () => {
  test('Test Order Total Price', async () => {
    const prisma = new PrismaClient();

    const startDate = new Date('2024-12-01');
    const endDate = new Date();
    const decemberDayList = generateListOfDateString(startDate, endDate);
    const ordersInDecember = await prisma.orders.findMany({
      where: {
        deliveryDate: {
          in: decemberDayList,
        },
      },
      include: {
        items: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
        user: true,
      },
    });

    const incorrectOrders = [];
    for (const order of ordersInDecember) {
      const actualTotalPrice = order.items.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity;
      }, 0);
      if (
        actualTotalPrice.toFixed(2) !==
          (order?.subTotal || order?.totalPrice)?.toFixed(2) &&
        (order?.discount === 0 || order?.discount === null)
      ) {
        incorrectOrders.push({
          id: order.id,
          deliveryDate: order.deliveryDate,
          clientName: order?.user?.clientName,
          clientId: order?.user?.clientId,
          actualTotalPrice: actualTotalPrice.toFixed(2),
          orderTotalPrice: order.totalPrice.toFixed(2),
          orderSubTotal: order.subTotal?.toFixed(2),
        });
      }
    }

    console.log(incorrectOrders, 'incorrectOrders');
    expect(incorrectOrders.length).toBe(0);
  }, 10000);
});
