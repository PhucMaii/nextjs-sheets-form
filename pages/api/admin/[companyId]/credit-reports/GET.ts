import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { normalizeDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate } = req.query as IQuery;

    if (!companyId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Company ID, startDate and endDate are required' });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));
    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    console.log({
      startDate,
      endDate,
      formattedStartDate,
      formattedEndDate,
      listOfDateString,
    });

    const creditReports = await prisma.creditReport.findMany({
      where: {
        companyId: Number(companyId),
        reportedDate: {
          in: listOfDateString,
        },
      },
      include: {
        user: true,
        creditItems: {
          include: {
            inventoryItem: true,
            orderedItem: true,
          },
        },
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    return res.status(200).json({
      data: creditReports,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
