import { prisma } from '@/lib/prisma';
import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Company ID, startDate and endDate are required' });
    }

    const normalizedStartDate = normalizeDate(new Date(startDate as string));
    const normalizedEndDate = normalizeDate(new Date(endDate as string));

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const chequeFiles = await prisma.cheque.findMany({
      where: {
        companyId: Number(companyId),
        userId: {
          not: null,
        },
        startDate: {
          in: listOfDateString,
        },
        endDate: {
          in: listOfDateString,
        },
      },
      include: {
        user: true,
      },
    });

    return res.status(200).json({
      data: chequeFiles,
      message: 'Cheque files fetched successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default handler;
