import { getDriverInfo } from '@/pages/api/utils/auth';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId }: any = req.query;

    let companyIdNumber = Number(companyId);

    if (isNaN(companyIdNumber)) {
      const employee: any = await getDriverInfo(req, res);
      companyIdNumber = employee?.companyId;
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        companyId: companyIdNumber,
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
