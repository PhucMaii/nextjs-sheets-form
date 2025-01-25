import { ORDER_STATUS, USER_CATEGORIZED } from '@/app/utils/enum';
import { DayRange, Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';

interface QueryTypes {
  day?: string;
  clientList?: string;
  deliveryDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { day, clientList, deliveryDate }: QueryTypes = req.query;

    const clientIds = clientList
      ? clientList.split(',').map((id) => parseInt(id))
      : [];

    let scheduleOrders = await prisma.scheduleOrders.findMany({
      where: {
        day,
        userId: {
          in: clientIds,
        },
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
        user: true,
      },
    });

    if (deliveryDate) {
      const clientPreOrdersInfo = await getClientsPreOrderInfo(
        clientIds,
        deliveryDate,
      );

      scheduleOrders = scheduleOrders.map((scheduledOrder: any) => {
        const userId = scheduledOrder.userId;

        const isInactive =
          scheduledOrder?.user?.type === USER_CATEGORIZED.INACTIVE;
        if (clientPreOrdersInfo[userId]) {
          // Place the blocked: isInactive before preOrderInfo because it could change by the blocking range
          return {
            ...scheduledOrder,
            blocked: isInactive,
            ...clientPreOrdersInfo[userId],
          };
        }

        return { ...scheduledOrder, blocked: isInactive };
      });
    }

    return res.status(200).json({
      data: scheduleOrders,
      message: 'Fetch Schedule Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

const getClientsPreOrderInfo = async (
  clientIdsList: number[],
  deliveryDate: string,
) => {
  try {
    const prisma = new PrismaClient();
    const formattedDate = normalizeDate(new Date(deliveryDate));

    const clientOrdersOnThatDay = await prisma.orders.findMany({
      where: {
        userId: {
          in: clientIdsList,
        },
        deliveryDate,
        status: {
          in: [
            ORDER_STATUS.INCOMPLETED,
            ORDER_STATUS.DELIVERED,
            ORDER_STATUS.COMPLETED,
          ],
        },
      },
    });

    // Use client orders array to get client who has ordered already
    const formattedClients = clientOrdersOnThatDay.reduce(
      (acc: any, order: Orders) => {
        const key = order.userId;

        if (!acc[key]) {
          acc[key] = { alreadyOrder: true };
        }

        return acc;
      },
      {},
    );

    const blockingRange = await prisma.dayRange.findMany({
      where: {
        userId: {
          in: clientIdsList,
        },
      },
      include: {
        user: true,
      },
    });

    // Filter range that includes delivery date only
    const filteredRange = blockingRange.filter((range: DayRange) => {
      const normalizedStartDate = normalizeDate(range.startDate); // Normalize start date
      const normalizedEndDate = normalizeDate(range.endDate);

      normalizedEndDate.setDate(normalizedEndDate.getDate() - 1);
      return (
        normalizedStartDate <= formattedDate &&
        normalizedEndDate >= formattedDate
      );
    });

    // Loop through range and add user who get blocked to the formattedClients list
    filteredRange.forEach((range: DayRange) => {
      const key = range.userId;

      if (!formattedClients[key]) {
        formattedClients[key] = { blocked: true };
      } else {
        formattedClients[key] = { ...formattedClients[key], blocked: true };
      }
    });

    console.log(formattedClients);
    return formattedClients;
  } catch (error: any) {
    console.log('Fail to get clients pre order info', error);
  }
};
