import { NextApiRequest, NextApiResponse } from 'next';
import withDriverAuthGuard from '../../utils/withDriverAuthGuar';
import { getDriverInfo } from '../../utils/auth';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(404).json({ error: 'Your method is not supported' });
  }
  try {
    const driver: any = await getDriverInfo(req, res);

    const vendors = await prisma.vendor.findMany({
      where: {
        companyId: driver.companyId,
      },
      include: {
        vendorItem: {
          include: {
            inventoryItem: true,
            unit: true,
            fifo: true,
          },
        },
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
