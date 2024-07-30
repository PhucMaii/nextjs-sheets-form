import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';

interface QueryTypes {
  dayRoute?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(404).json({
      error: 'Your method is not supported',
    });
  }
  try {
    const prisma = new PrismaClient();

    const { dayRoute }: QueryTypes = req.query;

    // Get all clients
    const clientList = await prisma.user.findMany({
      where: {
        role: 'client',
      },
      include: {
        category: true,
        preference: true,
        subCategory: true,
      },
    });

    if (!dayRoute) {
      return res.status(200).json({
        data: clientList,
        message: 'Fetch All Clients Successfully',
      });
    }

    const routesInDay = await prisma.route.findMany({
      where: {
        day: dayRoute,
      },
      include: {
        clients: {
          include: {
            user: true,
          },
        },
      },
    });

    const existedUserRoute = routesInDay
      .map((route: any) => {
        return route.clients?.map((userRoute: any) => {
          return userRoute.user;
        });
      })
      .flat();

    return res.status(200).json({
      data: { clientList, existedUserRoute },
      message: 'Fetch All Clients Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withDriverAuthGuard(handler);
