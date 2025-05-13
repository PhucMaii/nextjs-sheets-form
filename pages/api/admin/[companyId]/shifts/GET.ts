import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';

interface IQuery {
  startDate?: string;
  endDate?: string;
  driverId?: number;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate, driverId, companyId }: IQuery = req.query;

    if (!startDate || !endDate || !companyId) {
      return res.status(400).json({ error: 'Missing startDate or endDate or companyId' });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const queryFields: any = {
      date: {
        in: listOfDateString,
      },
      companyId: Number(companyId),
    };

    if (driverId && driverId > 0) {
      queryFields.driverId = Number(driverId);
    }

    const shiftSession = await prisma.shiftSession.findMany({
      where: queryFields,
      include: {
        driver: true,
        route: true,
      },
    });

    // Sort by startedAt
    shiftSession.sort((a, b) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

    return res.status(200).json({
      data: shiftSession,
      message: 'Fetch Shifts Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
