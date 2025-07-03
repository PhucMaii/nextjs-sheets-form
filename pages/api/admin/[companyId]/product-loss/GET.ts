import { generateListOfDateString } from '@/app/utils/time';
import { formatDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  id?: string;
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, startDate, endDate, companyId } = req.query as IQuery;

    if (id) {
      const productLoss = await prisma.lossReport.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          medias: true,
          inventoryItem: true,
          inventoryUnit: true,
        },
      });

      return res.status(200).json({
        message: 'Product loss retrieved successfully',
        data: productLoss,
      });
    }

    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const listOfDates = generateListOfDateString(
        formattedStartDate,
        formattedEndDate,
      );

      const productLosses = await prisma.lossReport.findMany({
        where: {
          reportedDate: {
            in: listOfDates,
          },
          companyId: Number(companyId),
        },
        include: {
          medias: true,
          inventoryItem: true,
          inventoryUnit: true,
        },
      });

      return res.status(200).json({
        message: 'Product losses retrieved successfully',
        data: productLosses,
      });
    }

    return res.status(400).json({
      error: 'Missing required parameters',
    });
  } catch (error: any) {
    console.log('Internal server error', error);
    return res.status(500).json({
      error: 'Something went wrong: ' + error,
    });
  }
}
