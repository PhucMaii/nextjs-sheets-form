import { days } from '@/app/lib/constant';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../../utils/date';
import { USER_ROLE } from '@/app/utils/enum';
// import { USER_ROLE } from '@/app/utils/enum';
// import { USER_ROLE } from '@/app/utils/enum';

interface IQuery {
  date?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { date, companyId } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (date) {
      const selectedDate = normalizeDate(new Date(date));
      const dayIndex = selectedDate.getDay();
      const day = days[dayIndex];

      const dayRoutes = await prisma.route.findMany({
        where: {
          day,
          companyId: Number(companyId),
        },
        include: {
          driver: true,
          employee: true,
        },
      });

      const drivers = dayRoutes.map((route) => {
        return route.driver;
      });

      return res.status(200).json({
        data: drivers,
        message: 'Fetch Drivers Successfully',
      });
    }

    // TODO: Fetch all drivers from employee table where role === driver
    const drivers = await prisma.employee.findMany({
      where: {
        companyId: Number(companyId),
        role: USER_ROLE.DRIVER,
      },
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
