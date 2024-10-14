import { days } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  date?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { date } = req.query as IQuery;

    if (date) {
      const selectedDate = new Date(date);
      const dayIndex = selectedDate.getDay();
      const day = days[dayIndex];

      const dayRoutes = await prisma.route.findMany({
        where: {
          day,
        },
        include: {
          driver: true
        }
      });

      const drivers = dayRoutes.map((route) => {
        return route.driver;
      });

      return res.status(200).json({
        data: drivers,
        message: 'Fetch Drivers Successfully',
      });
    }

    const drivers = await prisma.driver.findMany({
      include: {
        routes: true,
      },
    });

    return res.status(200).json({
      data: drivers,
      message: 'Fetch Drivers Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
