import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { normalizeDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { EvidenceType } from '@prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    if (!companyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Company ID, startDate and endDate are required' });
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
        transactions: {
          some: {
            date: {
              in: listOfDateString,
            },
          },
        },
        vendorId: null
      },
      include: {
        user: true,
        transactions: true,
      },
    });

    const mediaChequeFiles = await prisma.media.findMany({
      where: {
        companyId: Number(companyId),
        evidenceType: EvidenceType.CHEQUE,
        expense: {
            date: {
                in: listOfDateString,
            },
        },
      },
      include: {
        expense: true,
      },
    });

    return res.status(200).json({
      data: {
        chequeFiles,
        mediaChequeFiles,
      },
      message: 'Cheque files fetched successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);