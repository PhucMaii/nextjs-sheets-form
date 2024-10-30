import { Order } from '@/app/admin/orders/page';
import { days } from '@/app/lib/constant';
import { filterByRoute } from '@/app/utils/array';
import { COD_STATUS, ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { IBoard, IRoutes } from '@/app/utils/type';
import { getUserInfo } from '@/pages/api/utils/auth';
import { normalizeDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  todayString: string;
  createdAt: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { todayString, createdAt }: IBody = req.body;

    const user = await getUserInfo(req, res);

    if (!user) {
      return res.status(401).json({
        error: 'You are not authenticated',
      });
    }

    // Check if boards are added already
    const boardOrders: any = await prisma.orders.findMany({
      where: {
        deliveryDate: todayString,
        status: {
          not: ORDER_STATUS.VOID,
        },
        codBoardId: null,
        user: {
          preference: {
            paymentType: PAYMENT_TYPE.COD,
          },
        },
      },
      include: {
        items: true,
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
          },
        },
      },
    });

    const boards: any = await prisma.codBoard.findMany({
      where: {
        date: todayString,
      },
    });

    if (boards.length > 0 && boardOrders.length === 0) {
      return res.status(200).json({
        message: 'Boards are added already',
      });
    }

    const normalizedDate = normalizeDate(new Date(todayString));
    const dayIndex = normalizedDate.getDay();
    const day = days[dayIndex];

    const routeOnDate: any = await prisma.route.findMany({
      where: {
        day,
      },
      include: {
        driver: true,
        clients: true,
      },
    });

    // If there are new orders that have not been added
    if (boards.length > 0 && boardOrders.length > 0) {
      await insertOrdersToSelectedBoards(boardOrders, boards, routeOnDate);
      return res.status(200).json({
        message: 'New orders are added already',
      });
    }

    // Add Boards
    // Format board data to be valid to be added
    const formattedBoards = routeOnDate.map((route: any) => {
      return {
        date: todayString,
        cash: 0,
        driverId: route.driverId,
        note: '',
        status: COD_STATUS.IN_PROCESS,
        createdAt,
        createdBy: `Admin - ${user.clientName}`,
      };
    });

    await prisma.codBoard.createMany({
      data: formattedBoards,
    });

    const newBoards: any = await prisma.codBoard.findMany({
      where: {
        date: todayString,
      },
    });

    const dateOrders: any = await prisma.orders.findMany({
      where: {
        deliveryDate: todayString,
        status: {
          not: ORDER_STATUS.VOID,
        },
        user: {
          preference: {
            paymentType: PAYMENT_TYPE.COD,
          },
        },
      },
      include: {
        items: true,
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
          },
        },
      },
    });

    // Add Orders Into Boards
    // for (const board of newBoards) {
    //     const selectedRoute = routeOnDate.find((route: any) => route.driverId === board.driverId);
    //     if (!selectedRoute) {
    //         continue;
    //     }

    //     const filteredOrders = filterByRoute(dateOrders, selectedRoute);

    //     // Convert order list to order ids list
    //     const orderIds = filteredOrders.map((order: Order) => order.id);

    //     await prisma.orders.updateMany({
    //         where: {
    //           id: {
    //             in: orderIds,
    //           },
    //         },
    //         data: {
    //           codBoardId: board.id,
    //         },
    //     });
    // }
    await insertOrdersToSelectedBoards(dateOrders, newBoards, routeOnDate);

    return res.status(200).json({
      message: 'Boards Added Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);

const insertOrdersToSelectedBoards = async (
  orders: Order[],
  selectedBoards: IBoard[],
  routeOnDate: IRoutes[],
) => {
  const prisma = new PrismaClient();

  for (const board of selectedBoards) {
    const selectedRoute = routeOnDate.find(
      (route: any) => route.driverId === board.driverId,
    );
    if (!selectedRoute) {
      continue;
    }

    const filteredOrders = filterByRoute(orders, selectedRoute);

    // Convert order list to order ids list
    const orderIds = filteredOrders.map((order: Order) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        codBoardId: board.id,
      },
    });
  }
};
