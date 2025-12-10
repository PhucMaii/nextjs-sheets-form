import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import { PaymentStatus, PrismaClient, Route } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '@/pages/api/utils/date';
import { UserType } from '@/app/utils/type';
import { Order } from '@/app/admin/[companyId]/orders/page';

interface QueryType {
  day?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export interface ClientStatementType {
  client: UserType;
  orders: Order[];
  balance: number;
  incompletedOrders: Order[];
  voidOrders: Order[];
  completedOrders: Order[];
  deliveredOrders: Order[];
  route: Route;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { day, startDate, endDate, companyId }: QueryType = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    if (startDate && endDate) {
      const normalizedStartDate = normalizeDate(new Date(startDate));
      const normalizedEndDate = normalizeDate(new Date(endDate));

      const listOfDayStrings = generateListOfDateString(
        normalizedStartDate,
        normalizedEndDate,
      );

      const routes = await prisma.route.findMany({
        where: {
          day,
          companyId: Number(companyId),
        },
        include: {
          // driver: true,
          employee: true,
          clients: {
            where: {
              user: {
                preference: {
                  paymentType: PAYMENT_TYPE.MONTHLY,
                },
              },
            },
            include: {
              user: {
                include: {
                  preference: true,
                  category: true,
                  subCategory: true,
                  routes: true,
                  Orders: {
                    where: {
                      deliveryDate: {
                        in: listOfDayStrings,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const formattedClientOrders: any = {};
      routes.forEach((route: any) => {
        formattedClientOrders[route.id] = route.clients.map((client: any) => {
          const userOrders = client.user.Orders;

          const incompletedOrders = userOrders.filter(
            (order: any) => order.status === ORDER_STATUS.INCOMPLETED,
          );

          const deliveredOrders = userOrders.filter(
            (order: any) => order.status === ORDER_STATUS.DELIVERED,
          );

          const completedOrders = userOrders.filter(
            (order: any) => order.paymentStatus === PaymentStatus.Paid,
          );
          const voidOrders = userOrders.filter(
            (order: any) => order.status === ORDER_STATUS.VOID,
          );

          const balance = [...incompletedOrders, ...deliveredOrders].reduce(
            (acc: number, order: any) => {
              return acc + order.totalPrice;
            },
            0,
          );
          return {
            client: client.user,
            balance,
            orders: client.user.Orders,
            incompletedOrders,
            deliveredOrders,
            completedOrders,
            voidOrders,
            route: route,
          };
        });
      });

      return res.status(200).json({
        data: routes,
        formattedClientOrders,
        message: 'Fetch Routes Successfully',
      });
    }

    const routes: any = await prisma.route.findMany({
      where: {
        day,
        companyId: Number(companyId),
      },
      include: {
        // driver: true,
        employee: true,
        clients: {
          include: {
            user: {
              include: {
                preference: true,
                category: true,
                subCategory: true,
                routes: true,
                scheduleOrders: {
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

    // Sort client list in each route based on the scheduled orders
    const sortedRoutes = routes.map((route: any) => {
      return {
        ...route,
        clients: route.clients.sort((a: any, b: any) => {
          // find scheduled order of route day
          const scheduleOrderA = a.user.scheduleOrders.find(
            (order: any) => order.day === route.day,
          );
          const scheduleOrderB = b.user.scheduleOrders.find(
            (order: any) => order.day === route.day,
          );

          if (!scheduleOrderA || !scheduleOrderB) {
            return 0;
          }

          return (
            (scheduleOrderA?.positionIndex?.index ?? 0) -
            (scheduleOrderB?.positionIndex?.index ?? 0)
          );
        }),
      };
    });

    return res.status(200).json({
      data: sortedRoutes,
      // formattedClientOrders,
      message: 'Fetch Routes Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
