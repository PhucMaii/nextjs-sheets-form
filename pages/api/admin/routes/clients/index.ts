import { PrismaClient, UserRoute } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  day?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { day }: IQuery = req.query;

    if (!day) {
      return res.status(404).json({
        error: 'Day is not provided',
      });
    }

    const routeList = await prisma.route.findMany({
      where: {
        day,
      },
      include: {
        clients: true,
      },
    });

    const routeListWithUserId = routeList.reduce((acc: any, route: any) => {
      const routeKey = route.id;

      const clientIds = route.clients?.map((client: UserRoute) => {
        return client.userId;
      });
      acc[routeKey] = clientIds;
      return acc;
    }, {});

    return res.status(200).json({
      data: routeListWithUserId,
      message: 'Fetch Clients Based On Routes Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
