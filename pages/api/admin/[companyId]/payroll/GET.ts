import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { formatDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const formattedStartDate = formatDate(startDate as string);
    const formattedEndDate = formatDate(endDate as string);

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const payrolls = await prisma.payroll.findMany({
      where: {
        companyId: Number(companyId),
        OR: [
          { startDate: { in: listOfDateString } },
          { endDate: { in: listOfDateString } },
        ],
      },
      include: {
        employee: true,
      },
    });

    return res
      .status(200)
      .json({ data: payrolls, message: 'Payroll fetched successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
