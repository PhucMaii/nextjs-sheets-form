import prisma from '@/client';
import { getTodayDate, getTodayDay } from '@/pages/api/utils/date';
import { getBlockingRangesByDate } from '@/pages/api/unavailable_days/GET';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { getRouteByUserIdAndDay } from '@/pages/api/utils/route';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const today = getTodayDate();
    const todayDay = getTodayDay();

    const scheduledOrdersToday = await prisma.scheduleOrders.findMany({
      where: {
        companyId: Number(companyId),
        day: todayDay,
      },
      include: {
        user: {
          include: {
            routes: {
              include: {
                route: {
                  include: {
                    employee: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const ordersToday = await prisma.orders.findMany({
      where: {
        companyId: Number(companyId),
        deliveryDate: today.date,
      },
      include: {
        user: {
          include: {
            routes: {
              include: {
                route: true,
              },
            },
          },
        },
      },
    });

    const blockingRangesToday = await getBlockingRangesByDate(
      Number(companyId),
      today.date,
    );

    // Missed orders are the scheduled orders that are not in the orders today and not in the blocking ranges today
    const missedOrders = scheduledOrdersToday.filter((scheduledOrder) => {
      return (
        !ordersToday.some((order) => order.userId === scheduledOrder.userId) &&
        !Object.keys(blockingRangesToday).includes(
          `${scheduledOrder.user.clientName} - ${scheduledOrder.user.clientId}`,
        )
      );
    });

    // Format missed orders by route
    const formattedMissedOrders = missedOrders.reduce(
      (acc: any, missedOrder: any) => {
        const route = getRouteByUserIdAndDay(missedOrder.user, todayDay);
        if (!route) {
          return acc;
        }
        const routeKey = `${route?.route?.name} - ${route?.route?.employee?.name}`;
        if (!acc[routeKey]) {
          acc[routeKey] = [];
        }
        acc[routeKey].push(missedOrder);
        return acc;
      },
      {},
    );

    return res.status(200).json({
      data: { missedOrders, formattedMissedOrders },
    });
  } catch (error: any) {
    console.error('Internal Server Error: ', error);
    res.status(500).json({ error: error.message });
  }
};

export default withAdminAuthGuard(handler);
