import { findCombinations } from '@/app/utils/array';
import { ORDER_STATUS } from '@/app/utils/enum';
import { OrderedItems, Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';
import { generateListOfDateString } from '@/app/utils/time';

interface IQuery {
  startDate?: string;
  endDate?: string;
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, startDate, endDate }: IQuery = req.query;

    if (id) {
      const codBoard: any = await prisma.codBoard.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          driver: true,
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
        },
      });

      if (!codBoard) {
        return res.status(400).json({
          error: 'Cod Board Not Found',
        });
      }

      const boardOrdersWithTotalPriceItems = codBoard.orders.map(
        (order: any) => {
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
          };
        },
      );

      const uncollectedOrders = boardOrdersWithTotalPriceItems.filter(
        (order: Orders) => {
          return (
            order.status !== ORDER_STATUS.COMPLETED &&
            order.status !== ORDER_STATUS.VOID
          );
        },
      );

      const uncollectedAmount = uncollectedOrders.reduce(
        (acc: number, order: Orders) => {
          return acc + order.totalPrice;
        },
        0,
      );

      const cashDiff = Math.abs(codBoard.cash - uncollectedAmount);

      const expectedUnpaidOrders = boardOrdersWithTotalPriceItems.filter(
        (order: Orders) => {
          return order.totalPrice <= cashDiff;
        },
      );

      const expectedUnpaidAmount = expectedUnpaidOrders.reduce(
        (acc: any, order: Orders) => {
          if (acc[order.id]) {
            acc[order.id] = acc[order.id] + order.totalPrice;
            return acc;
          }

          acc[order.id] = order.totalPrice;
          return acc;
        },
        {},
      );

      const expectedUnpaidCombinations = findCombinations(Array.from(new Set(Object.values(expectedUnpaidAmount))), cashDiff);

      return res.status(200).json({
        data: {
          ...codBoard,
          orders: boardOrdersWithTotalPriceItems,
          expectedUnpaidOrders,
          expectedUnpaidCombinations,
          cashDiff,
        },
      });
    }

    if (startDate && endDate) {
      const formattedStartDate = normalizeDate(new Date(startDate));
      const formattedEndDate = normalizeDate(new Date(endDate));

      const listOfDateString = generateListOfDateString(formattedStartDate, formattedEndDate);

      const allCodBoards: any = await prisma.codBoard.findMany({
        where: {
          date: {
            in: listOfDateString,
          },
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

      // const selectedDate = new Date(date);

      // const dayIndex = selectedDate.getDay();
      // const day = days[dayIndex];

      if (allCodBoards.length === 0) {
        return res.status(200).json({
          data: [],
        });
      }

      const allBoardsWithDetails = allCodBoards.map((codBoard: any) => {

        const totalAmount = codBoard.orders.reduce((acc: number, order: Orders) => {
          return acc + order.totalPrice;
        }, 0);

        const boardClients = new Set(
          codBoard.orders.map((order: Orders) => {
            return order.userId;
          }),
        );

        const codData = getCODData(codBoard.orders);

        return {
          note: codBoard.note,
          cash: codBoard.cash,
          status: codBoard.status,
          driver: codBoard.driver,
          createdAt: codBoard.createdAt,
          date: codBoard.date,
          id: codBoard.id,
          driverId: codBoard.driverId,
          orders: codBoard.orders,
          createdBy: codBoard.createdBy,
          totalAmount,
          boardClients: Array.from(boardClients),
          ...codData,
        };
      });

      const mappedBoard = allBoardsWithDetails.reduce((acc: any, board: any) => {
          if (acc[board.date]) {
            acc[board.date] = acc[board.date].concat(board);
            return acc;
          }

          acc[board.date] = [board];
          return acc;
      }, {});

      return res.status(200).json({
        data: mappedBoard,
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
