import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { companyId } = req.query;

    const prisma = new PrismaClient();

    const items = await prisma.item.findMany({
      distinct: ['name'],
      where: {
        companyId: Number(companyId),
      },
    });

    const itemNames = items.map((item) => item.name);

    return res.status(200).json({
      data: itemNames,
      message: 'Fetch Items Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
