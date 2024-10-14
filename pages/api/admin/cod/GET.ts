import { days } from '@/app/lib/constant';
import { filterByRoute } from '@/app/utils/array';
import { ORDER_STATUS } from '@/app/utils/enum';
import { IRoutes } from '@/app/utils/type';
import { OrderedItems, Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  date?: string;
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, date }: IQuery = req.query;

    if (id) {
      const codBoard = await prisma.codBoard.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          orders: {
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
        },
      }
      });

      if (!codBoard) {
        return res.status(400).json({
          error: 'Cod Board Not Found',
        });
      }

      const boardOrdersWithTotalPriceItems = codBoard.orders.map((order: any) => {
        const formattedItems = order.items.map((item: OrderedItems) => {
          const totalPrice = item.quantity * item.price;
          return {
            ...item,
            totalPrice,
          };
        });

        return {
          ...order,
          items: formattedItems,
        }
      })

      return res.status(200).json({
        data: {...codBoard, orders: boardOrdersWithTotalPriceItems},
      });
    }

    if (date) {
      const allCodBoards: any = await prisma.codBoard.findMany({
        where: {
          date,
        },
        include: {
          orders: {
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
          },
          driver: {
            include: {
              routes: {
                include: {
                  clients: true,
                },
              },
            },
          },
        },
      });

      const selectedDate = new Date(date);

      const dayIndex = selectedDate.getDay();
      const day = days[dayIndex];

      if (allCodBoards.length === 0) {
        return res.status(200).json({
          data: [],
        });
      }

      const allBoardsWithDetails = allCodBoards.map((codBoard: any) => {
        const driverRoute = codBoard.driver?.routes.find((route: IRoutes) => {
          return route.day === day;
        });

        if (!driverRoute) {
          return res.status(400).json({
            error: 'Driver Route Not Found',
          });
        }

        const boardOrders = filterByRoute(codBoard.orders, driverRoute);

        const totalAmount = boardOrders.reduce((acc: number, order: Orders) => {
          return acc + order.totalPrice;
        }, 0);

        const boardClients = new Set(
          boardOrders.map((order: Orders) => {
            return order.userId;
          }),
        );

        const codData = getCODData(boardOrders);

        return {
          note: codBoard.note,
          cash: codBoard.cash,
          status: codBoard.status,
          driver: codBoard.driver,
          createdAt: codBoard.createdAt,
          date: codBoard.date,
          id: codBoard.id,
          driverId: codBoard.driverId,
          createBy: codBoard.createdBy,
          orders: boardOrders,
          totalAmount,
          boardClients: Array.from(boardClients),
          ...codData,
        };
      });

      return res.status(200).json({
        data: allBoardsWithDetails,
      });
    }

    return res.status(404).json({
      error: 'Missing required parameters',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

const getCODData = (orders: Orders[]) => {
  const uncollectedOrders = orders.filter((order: Orders) => {
    return (
      order.status !== ORDER_STATUS.COMPLETED &&
      order.status !== ORDER_STATUS.VOID
    );
  });

  const uncollectedAmount = uncollectedOrders.reduce(
    (acc: number, order: Orders) => {
      return acc + order.totalPrice;
    },
    0,
  );

  const collectedOrders = orders.filter((order: Orders) => {
    return order.status === ORDER_STATUS.COMPLETED;
  });

  const collectedAmount = collectedOrders.reduce(
    (acc: number, order: Orders) => {
      return acc + order.totalPrice;
    },
    0,
  );

  return {
    collected: {
      orders: collectedOrders,
      amount: collectedAmount,
    },
    uncollected: {
      orders: uncollectedOrders,
      amount: uncollectedAmount,
    },
  };
};
