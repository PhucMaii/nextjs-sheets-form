import prisma from '@/client';
import { errorResponse } from '@/pages/api/utils/response';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(404).json({
        error: 'Company ID is required',
      });
    }

    const deliveryProofFiles = await prisma.media.findMany({
      where: {
        companyId: Number(companyId),
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

    console.log(deliveryProofFiles, 'deliveryProofFiles');
    console.log(chequeFiles, 'chequeFiles');

    return res
      .status(200)
      .json({
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
