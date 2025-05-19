import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { authOptions } from '../../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

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

    const session: any = await getServerSession(req, res, authOptions);

    if (!session?.user || !session?.user?.companyId) {
      return res.status(404).json({
        error: 'Driver Not Found',
      });
    }
    // Get all clients
    const clientList = await prisma.user.findMany({
      where: {
        role: 'client',
        companyId: session?.user?.companyId,
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
        companyId: session?.user?.companyId,
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
