import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }

    const vendorItems = await prisma.vendorItem.findMany({
      where: {
        companyId: Number(companyId),
      },
      include: {
        inventoryItem: true,
        unit: true,
        fifo: true,
      },
    });

    // console.log(vendorItems, 'vendor items');
    return res.status(200).json({
      data: vendorItems,
      message: 'Fetch All Vendor Items Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
