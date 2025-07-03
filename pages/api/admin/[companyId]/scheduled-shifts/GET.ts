import { generateListOfDateString } from '@/app/utils/time';
import { formatDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate } = req.query as IQuery;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end date are required' });
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const scheduledShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateString,
        },
      },
      include: {
        employee: {
          include: {
            company: true,
          },
        },
      },
    });

    return res
      .status(200)
      .json({
        message: 'Scheduled shifts fetched successfully',
        data: scheduledShifts,
      });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Something went wrong: ' + error });
  }
}
