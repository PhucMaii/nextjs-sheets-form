import { ORDER_STATUS, PAYMENT_TYPE } from '@/app/utils/enum';
import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  date?: string;
  status?: ORDER_STATUS;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { date, status } = req.query as RequestQuery;

    const fetchCondition: any = {};

    if (status && status !== ORDER_STATUS.NONE) {
      fetchCondition.status = status;
    }

    if (date) {
      fetchCondition.deliveryDate = date;
    }

    const orders: any = await prisma.orders.findMany({
      where: fetchCondition,
      orderBy: [
        {
          updateTime: 'desc', // Sort by updateTime in descending order
        },
        {
          id: 'desc', // If updateTime is the same, sort by id in ascending order
        },
      ],
      include: {
        user: {
          include: {
            routes: true,
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
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
        user: {
          preference: {
            paymentType: PAYMENT_TYPE.COD,
          },
        },
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
        const totalPrice = item.quantity * item.price;
        return {
          ...item,
          totalPrice,
        };
      });

      const sameClientOrder = orders.filter(
        (sameOrder: any) =>
          sameOrder.userId === order.userId &&
          sameOrder.deliveryDate === order.deliveryDate &&
          sameOrder.status !== ORDER_STATUS.VOID &&
          order.status !== ORDER_STATUS.VOID,
      );

      return {
        ...order,
        items: formattedItems,
        ...order.user,
        id: order.id,
        category: order.user.category,
        previousUnpaidOrders: previousUnpaidCodOrdersMap[order.user.clientId]
          ? previousUnpaidCodOrdersMap[order.user.clientId]
          : null,
        multipleOrders: sameClientOrder.length > 1 ? true : false,
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
