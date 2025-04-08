import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { normalizeDate } from '../../utils/date';
import { generateListOfDateString } from '@/app/utils/time';

interface IQuery {
  startDate?: string;
  endDate?: string;
  driverId?: number;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { startDate, endDate, driverId }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const formattedStartDate = normalizeDate(
      `${startDate.split(' ')[1]} ${startDate.split(' ')[2]} ${startDate.split(' ')[3]}`,
    );
    const formattedEndDate = normalizeDate(
      `${endDate.split(' ')[1]} ${endDate.split(' ')[2]} ${endDate.split(' ')[3]}`,
    );

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const queryFields: any = {
      date: {
        in: listOfDateString,
      },
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

    return res.status(200).json({
      data: shiftSession,
      message: 'Fetch Shifts Successfully'
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
