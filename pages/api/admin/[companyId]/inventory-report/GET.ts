import { generateListOfDateString } from '@/app/utils/time';
import { prisma } from '@/lib/prisma';
import { normalizeDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
    companyId?: string;
    startDate?: string;
    endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate }: IQuery = req.query;

    if (!companyId) {
        return res.status(400).json({ error: 'Company ID is required' });
    }

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));
    const listOfDateString = generateListOfDateString(formattedStartDate, formattedEndDate);

    const inventoryReports = await prisma.inventoryReport.findMany({
        where: {
            companyId: Number(companyId),
            queryDate: { in: listOfDateString },
        },
        include: {  
            inventoryCount: true,
        },
        orderBy: {
            queryDate: 'desc',
        },
    });

    return res.status(200).json({ data: inventoryReports, message: 'Inventory reports fetched successfully' });
  } catch (error: any) {
    console.log('Something went wrong while getting inventory reports', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong while getting inventory reports' });
  }
}
