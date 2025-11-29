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

    const files = await prisma.media.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        expense: true,
        delivery: {
          include: {
            order: {
              include: {
                user: true,
              },
            },
          },
        },
        batchTransaction: true,
      },
    });

    return res
      .status(200)
      .json({ data: files, message: 'Files fetched successfully' });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return errorResponse(res, error);
  }
}
