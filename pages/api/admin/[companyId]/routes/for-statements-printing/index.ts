import prisma from '@/client';
import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';
import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { PaymentStatus } from '@prisma/client';

interface IQuery {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { companyId, startDate, endDate } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start Date and End Date are required',
      });
    }

    const normalizedStartDate = normalizeDate(new Date(startDate));
    const normalizedEndDate = normalizeDate(new Date(endDate));

    const listOfDayStrings = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const routes = await prisma.route.findMany({
      where: {
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

    // const formattedClientOrders: any = {};
    // routes.forEach((route: any) => {
    //   formattedClientOrders[route.id] = route.clients.map((client: any) => {
    //     const userOrders = client.user.Orders;

    //     const incompletedOrders = userOrders.filter(
    //       (order: any) => order.status === ORDER_STATUS.INCOMPLETED,
    //     );

    //     const deliveredOrders = userOrders.filter(
    //       (order: any) => order.status === ORDER_STATUS.DELIVERED,
    //     );

    //     const completedOrders = userOrders.filter(
    //       (order: any) => order.paymentStatus === PaymentStatus.Paid,
    //     );
    //     const voidOrders = userOrders.filter(
    //       (order: any) => order.status === ORDER_STATUS.VOID,
    //     );

    //     const balance = [...incompletedOrders, ...deliveredOrders].reduce(
    //       (acc: number, order: any) => {
    //         return acc + order.totalPrice;
    //       },
    //       0,
    //     );
    //     return {
    //       client: client.user,
    //       balance,
    //       orders: client.user.Orders,
    //       incompletedOrders,
    //       deliveredOrders,
    //       completedOrders,
    //       voidOrders,
    //       route: route,
    //     };
    //   });
    // });

    // Group routes by route name
    const processedClients: any[] = [];
    const repeatedClients: any[] = [];
    const groupedRoutesWithClients = routes.reduce((acc: any, route: any) => {
      if (!acc[route.name]) {
        acc[route.name] = [];
      }

      const clients = route.clients.map((client: any) => {
        if (acc[route.name]) {
            const isClientExist = acc[route.name].some((existedClient: any) => existedClient?.client?.id === client.user.id);
    
            if (isClientExist) {
              return null;
            }

        }

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

        const existedClient = processedClients.filter((processedClient: any) => processedClient.name === client.user.clientName);
        if (existedClient.length > 0) {
          repeatedClients.push({name: client.user.clientName, route: [route.name, ...existedClient.map((existedClient: any) => existedClient.route)].join(', ') });
        }
        processedClients.push({name: client.user.clientName, route: route.name});


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
      }).filter((client: any) => client !== null);
      
      acc[route.name].push(...clients);
      return acc;
    }, {});

    console.log({ groupedRoutesWithClients });
    console.log({ repeatedClients, length: repeatedClients.length });

    return res.status(200).json({
      data: groupedRoutesWithClients,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default handler;
