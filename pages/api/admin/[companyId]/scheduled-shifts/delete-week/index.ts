import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Missing companyId or startDate or endDate' });
    }

    const formattedStartDate = formatDate(startDate as string);
    const formattedEndDate = formatDate(endDate as string);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const weekShifts = await prisma.scheduledShift.findMany({
      where: {
        companyId: Number(companyId),
        queryDate: {
          in: listOfDateString,
        },
      },
    });

    if (weekShifts.length === 0) {
      return res.status(404).json({ error: 'Week shifts not found' });
    }

    await prisma.scheduledShift.deleteMany({
      where: {
        id: { in: weekShifts.map((shift) => shift.id) },
      },
    });

    return res.status(200).json({
      message: 'Week shifts deleted successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
