import { Order } from '@/app/admin/orders/page';
import { days } from '@/app/lib/constant';
import { generateRecommendDate } from '@/app/utils/time';
import { createOrder } from '@/pages/api/admin/orders/POST';
import { getRouteScheduledOrders } from '@/pages/api/admin/scheduledOrders/POST';
import { getTodayDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';

describe('Pre Order', () => {
  test('Pre order from a specific route', async () => {
    const prisma = new PrismaClient();

    // Get recommended date -> the date will be used by admin to schedule the order
    const recommendedDate = generateRecommendDate();
    const recommendedDateObj = new Date(recommendedDate);

    const day = days[recommendedDateObj.getDay()];

    const routeOnDay = await prisma.route.findMany({
      where: {
        day: day,
      },
      include: {
        clients: true,
      },
      orderBy: {
        clients: {
          _count: 'desc',
        },
      },
    });

    const selectedRoute = routeOnDay[0];

    const scheduledOrders = await getRouteScheduledOrders(selectedRoute.id);

    const { date, time } = getTodayDate();

    const newOrders = [];

    const minimizeOrders = scheduledOrders.slice(0, 2);

    for (const scheduledOrder of minimizeOrders) {
      if (scheduledOrder.totalPrice === 0) {
        continue;
      }

      const order = await createOrder(
        scheduledOrder.user,
        scheduledOrder.items,
        '01/01/3000',
        `${date} ${time}`,
        'Admin - Admin Test',
        'Automated Test Order',
      );

      newOrders.push(order);
    }

    // Check if new orders are created
    expect(newOrders.length).toBeGreaterThan(0);

    const invalidOrders = newOrders.filter((order: Order) => {
      const itemsValid = order.items.length > 0;

      const subtotalValid = order.items.reduce((acc: number, item: any) => {
        return acc + item.price * item.quantity;
      }, 0);

      return (
        !itemsValid ||
        subtotalValid !== order.subTotal ||
        subtotalValid + (order?.PST || 0) + (order?.GST || 0) !==
          order.totalPrice
      );
    });

    expect(invalidOrders.length).toBe(0);

    await prisma.orders.deleteMany({
      where: {
        id: {
          in: newOrders.map((order: Order) => order.id),
        },
      },
    });
  }, 90000);
});
