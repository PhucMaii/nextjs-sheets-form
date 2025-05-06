import { days } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';

interface IQuery {
  date?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { date } = req.query as IQuery;

    if (date) {
      const selectedDate = normalizeDate(new Date(date));
      const dayIndex = selectedDate.getDay();
      const day = days[dayIndex];

      const dayRoutes = await prisma.route.findMany({
        where: {
          day,
        },
        include: {
          employee: true,
        },
      });

      const employees = dayRoutes.map((route) => {
        return route.employee;
      });

      return res.status(200).json({
        data: employees,
        message: 'Fetch Employees Successfully',
      });
    }

    const employees = await prisma.employee.findMany({
      include: {
        routes: true,
      },
    });

    return res.status(200).json({
      data: employees,
      message: 'Fetch Employees Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
