import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  vendorItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { vendorItemId } = req.query as IQuery;

    if (!vendorItemId) {
      return res.status(404).json({
        error: 'Vendor Item Id Not Provided',
      });
    }

    const units = await prisma.inventoryUnit.findMany({
      where: {
        vendorItemId: Number(vendorItemId),
      },
    });

    return res.status(200).json({
      data: units,
      message: 'Fetch Units Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
