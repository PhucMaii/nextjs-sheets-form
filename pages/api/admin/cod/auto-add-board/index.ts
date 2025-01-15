import { Order } from '@/app/admin/orders/page';
import { days } from '@/app/lib/constant';
import { filterByRoute } from '@/app/utils/array';
import { COD_STATUS, ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { getWCODDay } from '@/app/utils/time';
import { IBoard, IRoutes } from '@/app/utils/type';
import { getUserInfo } from '@/pages/api/utils/auth';
import { generate7DaysBefore, getTodayDate, normalizeDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { CodBoard, PrismaClient, User } from '@prisma/client';
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

    const boards: any = await prisma.codBoard.findMany({
      where: {
        date: todayString,
      },
      include: {
        orders: true,
      },
    });

    const wcodDay: any = getWCODDay(todayString);
    const last7Days = generate7DaysBefore(todayString);

    // Check if boards are added already
    const newWCODBoardOrders = await prisma.orders.findMany({
      where: {
        deliveryDate: {
          in: last7Days,
        },
        status: {
          not: ORDER_STATUS.VOID,
        },
        codBoardId: null,
        user: {
          preference: {
            paymentType: {
              in: [wcodDay],
            },
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

    const newCODBoardOrders: any = await prisma.orders.findMany({
      where: {
        deliveryDate: todayString,
        status: {
          not: ORDER_STATUS.VOID,
        },
        codBoardId: null,
        user: {
          preference: {
            paymentType: {
              in: [PAYMENT_TYPE.COD],
            },
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

    
    const newBoardOrders = [...newWCODBoardOrders, ...newCODBoardOrders];
    console.log(newCODBoardOrders, 'newCODBoardOrders');
    console.log(newBoardOrders, 'newBoardOrders');

    if (boards.length > 0 && newBoardOrders.length === 0) {
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
    if (boards.length > 0 && newBoardOrders.length > 0) {
      await insertOrdersToSelectedBoards(
        newBoardOrders,
        boards,
        routeOnDate,
        todayString,
        user
      );
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
            paymentType: {
              in: [PAYMENT_TYPE.COD, wcodDay],
            },
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

    // const hasRouteOrders = dateOrders.filter((order: any) => {
    //   return order.user.routes.find((route: any) => route.day === day);
    // });

    
    // Add Orders Into Boards
    await insertOrdersToSelectedBoards(
      dateOrders,
      newBoards,
      routeOnDate,
      todayString,
      user
    );
    
    // Get no route orders
    // const noRouteOrderIds = dateOrders.filter((order: any) => {
    //   return order.user.routes.find((route: any) => route.day !== day);
    // }).map((order: any) => order.id);

    // Create and Add no route orders into no route board
    // const noRouteBoard = await prisma.codBoard.create({
    //   data: {
    //     date: todayString,
    //     cash: 0,
    //     driverId: -1,
    //     note: '',
    //     status: COD_STATUS.IN_PROCESS,
    //     createdAt,
    //     createdBy: `Admin - ${user.clientName}`,
    //   },
    // });

    // await prisma.orders.updateMany({
    //   where: {
    //     id: {
    //       in: noRouteOrderIds,
    //     },
    //   },
    //   data: {
    //     codBoardId: noRouteBoard.id,
    //   },
    // });


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
  date: string,
  user: User
) => {
  const prisma = new PrismaClient();

  const today = normalizeDate(new Date(date));

  const dayIndex = today.getDay();
  const day = days[dayIndex];

  // Get has route orders
  const hasRouteOrders = orders.filter((order: any) => {
    return order.user.routes.find((route: any) => route.day === day);
  });

  // Get no route orders to insert to no route board
  const noRouteOrderIds = orders.filter((order: any) => {
    return order.user.routes.length === 0 || order.user.routes.find((route: any) => route.day !== day);
  }).map((order: any) => order.id);

  console.log('noRouteOrderIds', orders);

  if (noRouteOrderIds.length > 0) {
    let noRouteBoard: CodBoard | undefined = selectedBoards.find(
      (board: any) => board.driverId === -1,
    );

    if (!noRouteBoard) {
      const { date, time } = getTodayDate();
      noRouteBoard = await prisma.codBoard.create({
        data: {
          date,
          cash: 0,
          driverId: -10,
          note: '',
          status: COD_STATUS.IN_PROCESS,
          createdAt: `${date} ${time}` ,
          createdBy: `Admin - ${user.clientName}`,
        },
      });
    }
    
    await prisma.orders.updateMany({
      where: {
        id: {
          in: noRouteOrderIds,
        },
      },
      data: {
        codBoardId: noRouteBoard.id,
      },
    });
  }


  for (const board of selectedBoards) {
    const selectedRoute = routeOnDate.find(
      (route: any) => route.driverId === board.driverId,
    );

    if (!selectedRoute) {
      continue;
    }

    const filteredOrders = filterByRoute(hasRouteOrders, selectedRoute);

    // Convert order list to order ids list
    const orderIds = filteredOrders.map((order: Order) => order.id);

    // Handle WCOD
    const wcodDay: any = getWCODDay(date);
    const clientIds = filteredOrders
      .filter((order: Order) => {
        return order?.user?.preference?.paymentType === wcodDay;
      })
      .map((order: Order) => order.userId);
    const dayList = generate7DaysBefore(date);

    // Get orders of wcod from last 7 days and push it to the same board
    if (clientIds.length > 0) {
      const wcodOrders = await prisma.orders.findMany({
        where: {
          userId: {
            in: clientIds,
          },
          deliveryDate: {
            in: dayList,
          },
          status: {
            in: [
              ORDER_STATUS.DELIVERED,
              ORDER_STATUS.INCOMPLETED,
              ORDER_STATUS.COMPLETED,
            ],
          },
        },
        include: {
          user: {
            include: {
              preference: true,
            },
          },
        },
      });

      if (wcodOrders.length > 0) {
        orderIds.push(...wcodOrders.map((order: any) => order.id));
      }
    }

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
