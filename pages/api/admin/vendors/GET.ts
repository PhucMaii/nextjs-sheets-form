import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const vendors = await prisma.vendor.findMany({
      include: {
        vendorItem: {
          include: {
            inventoryItem: true,
            unit: true,
            fifo: true
          }
        },
      }
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
