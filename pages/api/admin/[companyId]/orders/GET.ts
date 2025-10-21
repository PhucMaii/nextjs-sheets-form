import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { OrderedItems, PaymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '@/pages/api/utils/date';
import { days } from '@/app/lib/constant';
import prisma from '@/client';

interface RequestQuery {
  orderId?: string;
  date?: string;
  status?: ORDER_STATUS;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId, date, status, companyId } = req.query as RequestQuery;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    if (orderId) {
      const order = await prisma.orders.findUnique({
        where: { id: Number(orderId) },
        include: {
          reassignment: {
            include: {
              to: {
                include: {
                  employee: true,
                },
              },
            },
          },
          user: {
            include: {
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
          items: {
            include: {
              inventoryItem: true,
              inventoryUnit: true,
              fifo: true,
            },
          },
          delivery: {
            include: {
              medias: true,
            },
          },
          timeline: {
            include: {
              actions: {
                orderBy: {
                  posIndex: 'desc',
                },
              },
            },
          },
        },
      });

      // Group actions by date
      const groupedActions = order?.timeline?.actions.reduce(
        (acc: any, action: any) => {
          const date = action.createdAt.split(' ')[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(action);
          return acc;
        },
        {},
      );

      // Get order route
      const orderRoute = getOrderRoute(order);
      console.log(orderRoute, 'orderRoute');

      return res.status(200).json({
        message: 'Fetch Order Successfully',
        data: {
          ...order,
          timeline: {
            ...order?.timeline,
            groupedActions,
          },
          orderRoute,
        },
      });
    }

    const fetchCondition: any = {};

    if (status && status !== ORDER_STATUS.NONE) {
      fetchCondition.status = status;
    }

    if (date) {
      fetchCondition.deliveryDate = date;
    }

    const orders: any = await prisma.orders.findMany({
      where: { ...fetchCondition, companyId: Number(companyId) },
      orderBy: [
        {
          updateTime: 'desc', // Sort by updateTime in descending order
        },
        {
          id: 'desc', // If updateTime is the same, sort by id in ascending order
        },
      ],
      include: {
        reassignment: {
          include: {
            to: {
              include: {
                employee: true,
              },
            },
          },
        },
        user: {
          include: {
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
            preference: true,
            category: true,
          },
        },
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
        delivery: {
          include: {
            medias: true,
          },
        },
      },
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: 'There is no orders at the momment',
        data: orders,
      });
    }

    // Get previous unpaid cod orders
    const previousUnpaidCodOrders = await prisma.orders.findMany({
      where: {
        status: {
          not: ORDER_STATUS.VOID,
        },
        paymentStatus: PaymentStatus.Unpaid,
        user: {
          preference: {
            paymentType: PAYMENT_TYPE.COD,
          },
        },
        companyId: Number(companyId),
      },
      include: {
        user: true,
      },
    });

    // Use hashmap to store previous unpaid cod orders with client id is key
    const previousUnpaidCodOrdersMap = previousUnpaidCodOrders.reduce(
      (acc: any, order: any) => {
        if (!acc[order.user.clientId]) {
          acc[order.user.clientId] = {
            numberOfOrders: 1,
            totalPrice: order.totalPrice,
          };
          return acc;
        }

        const newTotalPrice =
          acc[order.user.clientId].totalPrice + order.totalPrice;
        const newNumberOfOrders = acc[order.user.clientId].numberOfOrders + 1;
        acc[order.user.clientId] = {
          numberOfOrders: newNumberOfOrders,
          totalPrice: newTotalPrice,
        };
        return acc;
      },
      {},
    );

    // console.log('-- BATCH ORDERS --');
    // console.log({orders, date}, 'orders');

    // Format return result
    const newOrders = orders.map((order: any) => {
      const formattedItems = order.items.map((item: OrderedItems) => {
        let totalPrevPrice = 0;
        if (item?.isShowDiscount && item?.prevPrice) {
          totalPrevPrice = item.prevPrice * item.quantity;
        }
        const totalPrice = item.quantity * item.price;
        return {
          ...item,
          totalPrice,
          totalPrevPrice,
        };
      });

      // Get same order in same date
      const sameClientOrder = orders.filter(
        (sameOrder: any) =>
          sameOrder.userId === order.userId &&
          sameOrder.deliveryDate === order.deliveryDate &&
          sameOrder.status !== ORDER_STATUS.VOID &&
          order.status !== ORDER_STATUS.VOID,
      );

      // Get order route
      // const orderDeliveryDate: Date = normalizeDate(order.deliveryDate);
      // const orderDayIndex = orderDeliveryDate.getDay();
      // const orderDay = days[orderDayIndex];
      // const orderRoute = order.user.routes.find((route: any) => {
      //   return route.route.day === orderDay;
      // });
      const orderRoute = getOrderRoute(order);

      // Calculate order profit
      const profit = calculateOrderProfit(formattedItems);

      return {
        ...order,
        items: formattedItems,
        ...order.user,
        id: order.id,
        type: order?.type,
        category: order.user.category,
        previousUnpaidOrders: previousUnpaidCodOrdersMap[order.user.clientId]
          ? previousUnpaidCodOrdersMap[order.user.clientId]
          : null,
        multipleOrders: sameClientOrder.length > 1 ? true : false,
        orderRoute: orderRoute,
        profit,
      };
    });

    return res.status(200).json({
      message: 'Fetch All Orders Successfully',
      data: newOrders,
    });
  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}

export const calculateOrderProfit = (items: OrderedItems[]) => {
  const profit = items.reduce((acc: number, item: OrderedItems) => {
    return acc + (item?.profit || 0) * item.quantity;
  }, 0);

  return profit;
};

export const getOrderRoute = (order: any) => {
  if (order?.reassignment) {
    return `${order.reassignment.to.name} - ${order.reassignment.to.employee.name}`;
  }
  const orderDeliveryDate: Date = normalizeDate(order.deliveryDate);
  const orderDayIndex = orderDeliveryDate.getDay();
  const orderDay = days[orderDayIndex];
  if (!order.user.routes || order.user.routes.length === 0) {
    return 'No route - N/A';
  }
  const orderRoute = order.user.routes.find((route: any) => {
    return route?.route?.day === orderDay;
  });

  return orderRoute
    ? `${orderRoute?.route?.name} - ${orderRoute?.route?.employee?.name}`
    : 'No route - N/A';
};
