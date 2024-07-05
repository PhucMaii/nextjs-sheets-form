import { Orders, PrismaClient, Route, UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { days } from '@/app/lib/constant';
import { convertDeliveryDateStringToDate } from '../../utils/date';
import { generateManifest } from '../../admin/orders/overview';

interface IQuery {
  deliveryDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { deliveryDate }: IQuery = req.query;

    if (!deliveryDate) {
      return res.status(404).json({
        error: 'Delivery Date Is Missing',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);

    const existingDriver = await prisma.driver.findUnique({
      where: {
        id: Number(session?.user?.id),
      },
      include: {
        routes: {
          include: {
            clients: true,
          },
        },
      },
    });

    if (!existingDriver) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }

    const date = convertDeliveryDateStringToDate(deliveryDate);
    const day = days[date.getDay()];

    const targetRoute = existingDriver.routes.find((route: Route) => {
      return route.day === day;
    });

    const userIds = targetRoute?.clients.map((userRoute: UserRoute) => {
      return userRoute.userId;
    });

    const deliveryOrders = await prisma.orders.findMany({
      where: {
        userId: {
          in: userIds,
        },
        deliveryDate,
      },
      include: {
        user: true,
        items: true,
      },
    });

    const manifest = generateManifest(deliveryOrders);
    const codAmount = deliveryOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    return res.status(200).json({
      data: { deliveryOrders, manifest, codAmount },
      message: 'Fetch Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
