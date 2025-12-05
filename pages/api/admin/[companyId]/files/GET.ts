import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { normalizeDate } from '@/pages/api/utils/date';
import { errorResponse } from '@/pages/api/utils/response';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId) {
      return res.status(404).json({
        error: 'Company ID is required',
      });
    }

    const query: any = {
      companyId: Number(companyId),
    };
    if (startDate && endDate) {
      const normalizedStartDate = normalizeDate(new Date(startDate as string));
      const normalizedEndDate = normalizeDate(new Date(endDate as string));

      const listOfDateString = generateListOfDateString(
        normalizedStartDate,
        normalizedEndDate,
      );

      query.delivery = {
        order: {
          deliveryDate: {
            in: listOfDateString,
          },
        },
      };
    }

    const deliveryProofFiles = await prisma.media.findMany({
      where: {
        ...query,
      },
      include: {
        delivery: {
          include: {
            order: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    const chequeFiles = await prisma.cheque.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        user: true,
        transactions: true,
        vendor: true,
      },
    });

    return res.status(200).json({
      data: {
        deliveryProofFiles,
        chequeFiles,
      },
      message: 'Files fetched successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return errorResponse(res, error);
  }
}
