import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        companyId: Number(companyId),
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
}
