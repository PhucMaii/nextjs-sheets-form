import { findCombinations } from '@/app/utils/array';
import { COD_STATUS, ORDER_STATUS } from '@/app/utils/enum';
import {
  OrderedItems,
  Orders,
  PaymentStatus,
  PrismaClient,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateListOfDateString } from '@/app/utils/time';
import { IBoard } from '@/app/utils/type';
import { days } from '@/app/lib/constant';
import { normalizeDate } from '@/pages/api/utils/date';
// import { IBoard } from '@/app/utils/type';

interface IQuery {
  startDate?: string;
  endDate?: string;
  date?: string;
  id?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, date, startDate, endDate, companyId }: IQuery = req.query;

    if (id) {
      const codBoard: any = await prisma.codBoard.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          employee: true,
          expense: {
            include: {
              paymentMethod: true,
              vendors: true,
              orderedItems: true,
            },
          },
          orders: {
            include: {
              items: {
                include: {
                  inventoryItem: true,
                  inventoryUnit: true,
                },
              },
              user: {
                include: {
                  preference: true,
                  category: true,
                  routes: {
                    include: {
                      route: {
                        include: {
                          driver: true,
                          employee: true,
                        },
                      },
                    },
                  },
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

          // Get order route
          const orderDeliveryDate: Date = normalizeDate(order.deliveryDate);
          const orderDayIndex = orderDeliveryDate.getDay();
          const orderDay = days[orderDayIndex];
          const orderRoute = order.user.routes.find((route: any) => {
            return route.route.day === orderDay;
          });

          return {
            ...order,
            items: formattedItems,
            orderRoute: orderRoute
              ? `${orderRoute.route.name} - ${orderRoute?.route?.employee?.name}`
              : 'No route - N/A',
          };
        },
      );

      const uncollectedOrders = boardOrdersWithTotalPriceItems.filter(
        (order: Orders) => {
          return order.paymentStatus === PaymentStatus.Unpaid;
        },
      );

      if (
        uncollectedOrders.length === 0 &&
        codBoard.status === COD_STATUS.IN_PROCESS
      ) {
        await prisma.codBoard.update({
          where: {
            id: codBoard.id,
          },
          data: {
            status: COD_STATUS.CLEARED,
          },
        });
      } else if (
        uncollectedOrders.length > 0 &&
        codBoard.status === COD_STATUS.CLEARED
      ) {
        await prisma.codBoard.update({
          where: {
            id: codBoard.id,
          },
          data: {
            status: COD_STATUS.IN_PROCESS,
          },
        });
      }

      const uncollectedAmount = uncollectedOrders.reduce(
        (acc: number, order: Orders) => {
          return acc + order.totalPrice;
        },
        0,
      );

      const expenseAmount = codBoard.expense.reduce(
        (acc: number, item: any) => {
          return acc + item.amount;
        },
        0,
      );
    
      const totalAmount = boardOrdersWithTotalPriceItems.reduce(
        (acc: number, order: Orders) => {
          return acc + order.totalPrice;
        },
        0,
      );

      const cashDiff = Math.abs(
        codBoard.cash + expenseAmount - totalAmount,
      );

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

      const expectedUnpaidCombinations = findCombinations(
        Array.from(new Set(Object.values(expectedUnpaidAmount))),
        cashDiff,
      );

      // Find client position index for board
      const boardDay = days[normalizeDate(codBoard.date).getDay()];
      const boardRoute = await prisma.route.findFirst({
        where: {
          day: boardDay,
          companyId: Number(companyId),
          employeeId: codBoard.employeeId,
        },
        include: {
          clients: {
            include: {
              user: {
                include: {
                  scheduleOrders: {
                    where: {
                      day: boardDay,
                    },
                    include: {
                      positionIndex: true,
                    },
                  },
                },
              },
            },
          },
        },
      });


      // Because one client only have one schedule order in one day, so we can sort by the position index of the first schedule order
      const boardClientPositionIndex = boardRoute?.clients.sort(
        (clientA: any, clientB: any) => {
          return (
            clientA.user.scheduleOrders[0]?.positionIndex.index -
            clientB.user.scheduleOrders[0]?.positionIndex.index
          );
        },
      ).map((client: any) => {
        return {
          userId: client.user.id,
          positionIndex: client.user.scheduleOrders[0]?.positionIndex.index,
        }
      });

      return res.status(200).json({
        data: {
          ...codBoard,
          orders: boardOrdersWithTotalPriceItems,
          expectedUnpaidOrders,
          expectedUnpaidCombinations,
          cashDiff,
          boardClientPositionIndex,
        },
      });
    }

    if (date) {
      // const selectedDate = new Date(date);

      // const dayIndex = selectedDate.getDay();
      // const day = days[dayIndex];
      const dateBoards: any = await prisma.codBoard.findMany({
        where: {
          date,
          companyId: Number(companyId),
        },
        include: {
          driver: true,
          employee: true,
          expense: {
            include: {
              paymentMethod: true,
              vendors: true,
              orderedItems: true,
            },
          },
          orders: {
            include: {
              items: {
                include: {
                  inventoryItem: true,
                  inventoryUnit: true,
                },
              },
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

      // await checkBoardStatus(dateBoards);

      if (dateBoards.length === 0) {
        return res.status(200).json({
          data: [],
        });
      }

      const allBoardsWithDetails = formatBoards(dateBoards);
      return res.status(200).json({
        data: allBoardsWithDetails,
      });
    }

    if (startDate && endDate) {
      const formattedStartDate = normalizeDate(new Date(startDate));
      const formattedEndDate = normalizeDate(new Date(endDate));

      const listOfDateString = generateListOfDateString(
        formattedStartDate,
        formattedEndDate,
      );

      const allCodBoards: any = await prisma.codBoard.findMany({
        where: {
          date: {
            in: listOfDateString,
          },
          companyId: Number(companyId),
        },
        include: {
          employee: true,
          expense: {
            include: {
              paymentMethod: true,
              vendors: {
                include: {
                  vendor: true,
                },
              },
              orderedItems: true,
            },
          },
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

      if (allCodBoards.length === 0) {
        return res.status(200).json({
          data: [],
        });
      }

      // await checkBoardStatus(allCodBoards);

      const allBoardsWithDetails = formatBoards(allCodBoards);

      const mappedBoard = allBoardsWithDetails.reduce(
        (acc: any, board: any) => {
          if (acc[board.date]) {
            acc[board.date] = acc[board.date].concat(board);
            return acc;
          }

          acc[board.date] = [board];
          return acc;
        },
        {},
      );

      const sortedDate =
        Object.keys(mappedBoard).length > 0 &&
        Object.keys(mappedBoard).sort((a: any, b: any) => {
          return new Date(b).getTime() - new Date(a).getTime();
        });

      return res.status(200).json({
        data: mappedBoard,
        sortedDate,
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

// const checkBoardStatus = async (boards: IBoard[]) => {
//   const prisma = new PrismaClient();
//   const boardsStatusMap = boards.reduce((acc: any, board: any) => {
//       const { id, status, orders } = board;

//       const uncollectedOrders = orders.filter((order: any) => {
//         return order.status === ORDER_STATUS.INCOMPLETED || order.status === ORDER_STATUS.DELIVERED;
//       });

//       if (uncollectedOrders.length === 0 && status === COD_STATUS.IN_PROCESS) {
//         acc.CLEARED.push(id);
//       } else if (uncollectedOrders.length > 0 && status === COD_STATUS.CLEARED) {
//         acc.IN_PROCESS.push(id);
//       }
//   }, {});

//   if (Object.keys(boardsStatusMap).length === 0) {
//     return;
//   }

//   if (boardsStatusMap.CLEARED.length > 0) {
//     await prisma.codBoard.updateMany({
//         where: {
//           id: {
//             in: boardsStatusMap.CLEARED
//           }
//         },
//         data: {
//           status: COD_STATUS.CLEARED
//         }
//       })
//   }

//   if (boardsStatusMap.IN_PROCESS.length > 0) {
//     await prisma.codBoard.updateMany({
//         where: {
//           id: {
//             in: boardsStatusMap.IN_PROCESS
//           }
//         },
//         data: {
//           status: COD_STATUS.IN_PROCESS
//         }
//       })
//   }

// }

const formatBoards = (boards: any) => {
  const allBoardsWithDetails = boards.map((codBoard: any) => {
    const totalAmount = codBoard.orders.reduce((acc: number, order: Orders) => {
      if (order.status === ORDER_STATUS.VOID) {
        return acc;
      }
      return acc + order.totalPrice;
    }, 0);

    const boardClients = new Set(
      codBoard.orders.map((order: Orders) => {
        return order.userId;
      }),
    );

    const nonVoidOrders = codBoard.orders.filter(
      (order: Orders) => order.status !== ORDER_STATUS.VOID,
    );

    const codData = getCODData(nonVoidOrders);

    const cashDiff = calculateCashDiff(codBoard, totalAmount);

    return {
      note: codBoard.note,
      cash: codBoard.cash,
      status: codBoard.status,
      employee: codBoard.employee,
      createdAt: codBoard.createdAt,
      date: codBoard.date,
      id: codBoard.id,
      employeeId: codBoard.employeeId,
      orders: codBoard.orders,
      createdBy: codBoard.createdBy,
      expense: codBoard.expense,
      totalAmount,
      cashDiff,
      boardClients: Array.from(boardClients),
      ...codData,
    };
  });

  return allBoardsWithDetails;
};

const getCODData = (orders: Orders[]) => {
  const uncollectedOrders = orders.filter((order: Orders) => {
    return order.paymentStatus === PaymentStatus.Unpaid;
  });

  const uncollectedAmount = uncollectedOrders.reduce(
    (acc: number, order: Orders) => {
      return acc + order.totalPrice;
    },
    0,
  );

  const collectedOrders = orders.filter((order: Orders) => {
    return order.paymentStatus === PaymentStatus.Paid;
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

const calculateCashDiff = (board: IBoard, totalAmount: number) => {
  let amount = 0;
  if (board?.expense && board?.expense.length > 0) {
    amount = board.expense.reduce((acc: number, expense: any) => {
      return acc + expense.amount;
    }, 0);
  }
  const cashDiff = Math.abs(board.cash + amount - totalAmount);

  return cashDiff;
};
