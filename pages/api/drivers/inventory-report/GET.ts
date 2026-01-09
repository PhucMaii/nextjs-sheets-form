import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { normalizeDate } from '@/pages/api/utils/date';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { startDate, endDate }: IQuery = req.query;

    const driver = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required',
      });
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));
    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const inventoryReports = await prisma.inventoryReport.findMany({
      where: {
        companyId: driver.companyId,
        queryDate: { in: listOfDateString },
      },
      include: {
        inventoryCounts: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
          },
        },
      },
      orderBy: {
        queryDate: 'desc',
      },
    });

    return res.status(200).json({
      data: inventoryReports,
      message: 'Inventory reports fetched successfully',
    });
  } catch (error: any) {
    console.log('Something went wrong while getting inventory reports', error);
    return res.status(500).json({
      error: 'Something went wrong while getting inventory reports',
    });
  }
}
