import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface QueryTypes {
  dayRoute?: string;
  role?: USER_ROLE;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { dayRoute, role }: QueryTypes = req.query;

    // Get all clients
    const clientList = await prisma.user.findMany({
      where: {
        role: role || USER_ROLE.CLIENT,
      },
      include: {
        category: true,
        preference: true,
        // subCategory: true,
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
}
