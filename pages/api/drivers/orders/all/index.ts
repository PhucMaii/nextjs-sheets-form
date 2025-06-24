import { ORDER_STATUS } from '@/app/utils/enum';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

interface IQuery {
  deliveryDate?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { deliveryDate }: IQuery = req.query;

    const session: any = await getServerSession(req, res, authOptions);

    const driver = session?.user;

    const deliveryOrders = await prisma.orders.findMany({
      where: {
        deliveryDate,
        companyId: driver?.companyId,
        status: {
          not: ORDER_STATUS.VOID,
        },
      },
      include: {
        user: {
          include: {
            preference: true,
            category: true,
            routes: true,
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

    const returnOrders = deliveryOrders.map((order: any) => {
      const newItems = order.items.map((item: any) => {
        const totalPrice = item.quantity * item.price;
        return { ...item, totalPrice };
      });
      return {
        ...order.user,
        ...order,
        id: order.id,
        items: newItems,
      };
    });

    return res.status(200).json({
      data: { deliveryOrders: returnOrders },
      message: 'Fetch All Delivery Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
