import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import { calculateHours } from '../../drivers/shift/clock-out';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activeShifts = await prisma.shiftSession.findMany({
      where: {
        endedAt: null,
        isActive: true,
      },
      include: {
        driver: true,
        route: true,
      },
    });

    // End shifts
    const today = getTodayDate();

    const todayOrders = await prisma.orders.findMany({
      where: {
        deliveryDate: today.date,
      },
    });

    for (const shift of activeShifts) {
      // const hours = calculateHours(shift.startedAt, today.dateAndTime);

      // await prisma.shiftSession.update({
      //   where: {
      //     id: shift.id,
      //   },
      //   data: {
      //     endedAt: today.dateAndTime,
      //     hours,
      //     isActive: false,

      //   },
      // });

      const orderDeliveredByDriver = todayOrders.filter((order) => {
        return order.deliveredBy === shift.driver.name;
      });

      // Get the latest order delivered by driver
      const latestOrder = orderDeliveredByDriver.sort((a, b) => {
        return (
          new Date(b.deliveryDate).getTime() -
          new Date(a.deliveryDate).getTime()
        );
      })[0];

      if (latestOrder && latestOrder.deliveredAt) {
        const hours = calculateHours(shift.startedAt, latestOrder.deliveredAt);

        await prisma.shiftSession.update({
          where: {
            id: shift.id,
          },
          data: {
            endedAt: latestOrder.deliveredAt,
            hours,
            isActive: false,
            cost: hours * (shift?.driver?.hourlyRate || 1),
          },
        });
      } else {
        const hours = calculateHours(shift.startedAt, today.dateAndTime);
        await prisma.shiftSession.update({
          where: {
            id: shift.id,
          },
          data: {
            endedAt: today.dateAndTime,
            isActive: false,
            hours,
            cost: hours * (shift?.driver?.hourlyRate || 1),
          },
        });
      }
    }

    return res.status(200).json({
      message: 'Clock out all drivers successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
