import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(404).json({ error: 'Your method is not supported' });
  }
  try {
    const prisma = new PrismaClient();

    const vendors = await prisma.vendor.findMany({
      include: {
        inventoryItems: true,
      },
    });

    return res.status(200).json({
      data: vendors,
      message: 'Fetch All Vendors Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withDriverAuthGuard(handler);
