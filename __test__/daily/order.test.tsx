import { generateListOfDateString } from '@/app/utils/time';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';

describe('Check for incorrect orders', () => {
  const prisma = new PrismaClient();
  const startDate = new Date('2025-03-01');
  const endDate = getTodayDate();
  const endDateFormatted = new Date(`${endDate.date} ${endDate.time}`);
  endDateFormatted.setDate(endDateFormatted.getDate() + 1);
  const decemberDayList = generateListOfDateString(startDate, endDateFormatted);
  console.log(decemberDayList, 'december day list');
  test('Test Order Total Price', async () => {
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

  test('Check if subtotal is different from total', async () => {
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
      const subTotalWithTax =
        (order?.subTotal || order?.totalPrice) +
        (order?.PST || 0) +
        (order?.GST || 0);

      if (subTotalWithTax?.toFixed(2) !== order.totalPrice?.toFixed(2)) {
        incorrectOrders.push(order);
      }
    }

    console.log(incorrectOrders, 'incorrectOrders');
    expect(incorrectOrders.length).toBe(0);
  }, 10000);
});

//test if the hour in blocking time is incorrect
