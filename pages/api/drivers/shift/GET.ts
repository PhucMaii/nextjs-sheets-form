import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '../../utils/date';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { startDate, endDate }: IQuery = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const driver: any = await getDriverInfo(req, res);

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

    const shiftSession = await prisma.shiftSession.findMany({
      where: {
        date: {
          in: listOfDateString,
        },
        driverId: driver.id,
      },
    });

    // Sort by startedAt
    shiftSession.sort((a: any, b: any) => {
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

    return res.status(200).json({
      data: shiftSession,
      message: 'Fetch Shift Session Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
