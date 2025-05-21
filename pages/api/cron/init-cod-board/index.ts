import { PrismaClient } from '@prisma/client';
import { getTodayDate, normalizeDate } from '@/pages/api/utils/date';
import { days } from '@/app/lib/constant';
import { COD_STATUS, ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { getWCODDay } from '@/app/utils/time';
import { insertOrdersToSelectedBoards } from '@/pages/api/admin/[companyId]/cod/auto-add-board';

// CRON JOB FOR COMPANY ID 1 ONLY

export default async function handler(req: any, res: any) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prisma = new PrismaClient();

    // Check if cod boards exist for today
    const { date, time } = getTodayDate();

    const codBoards = await prisma.codBoard.findMany({
      where: {
        companyId: 1,
        date: date,
      },
    });

    if (codBoards.length > 0) {
      return res.status(200).json({
        message: 'Action already taken',
      });
    }

    const normalizedDate = normalizeDate(new Date(date));
    const dayIndex = normalizedDate.getDay();
    const day = days[dayIndex];

    const wcodDay: any = getWCODDay(date);

    const routeOnDate: any = await prisma.route.findMany({
      where: {
        day,
        companyId: 1,
      },
      include: {
        employee: true,
        clients: true,
      },
    });

    const formattedBoards = routeOnDate.map((route: any) => {
      return {
        date: date,
        cash: 0,
        driverId: route.driverId,
        employeeId: route.employeeId,
        note: '',
        status: COD_STATUS.IN_PROCESS,
        createdAt: `${date} ${time}`,
        createdBy: `System`,
        companyId: 1,
      };
    });

    await prisma.codBoard.createMany({
      data: formattedBoards,
    });

    const newBoards: any = await prisma.codBoard.findMany({
      where: {
        companyId: 1,
        date: date,
      },
    });

    const dateOrders: any = await prisma.orders.findMany({
      where: {
        deliveryDate: date,
        status: {
          not: ORDER_STATUS.VOID,
        },
        user: {
          preference: {
            paymentType: {
              in: [PAYMENT_TYPE.COD, wcodDay],
            },
          },
        },
        codBoardId: null,
        companyId: 1,
      },
      include: {
        items: true,
        user: {
          include: {
            preference: true,
            category: true,
            routes: {
              include: {
                route: true,
              },
            },
          },
        },
      },
    });

    // const hasRouteOrders = dateOrders.filter((order: any) => {
    //   return order.user.routes.find((route: any) => route.day === day);
    // });

    // Add Orders Into Boards
    await insertOrdersToSelectedBoards(
      1, // Temporary only update for companyId 1
      dateOrders,
      newBoards,
      routeOnDate,
      date,
      { clientName: 'System' },
    );

    return res.status(200).json({
      message: 'Init board successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
