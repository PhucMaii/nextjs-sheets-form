import prisma from '@/client';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { sortItemsByTypeAndIdx } from '../../admin/[companyId]/items/GET';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const driver = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const inventory: any = await prisma.inventoryItem.findMany({
      where: {
        companyId: driver.companyId,
        OR: [{ isInternal: null }, { isInternal: false }],
        isAllowedToCount: true,
      },
      include: {
        subtractRules: {
          include: {
            dependentInventoryItem: true,
          },
        },
        fifo: {
          include: {
            vendorItem: {
              include: {
                vendor: true,
              },
            },
          },
        },
        vendorItem: {
          include: {
            vendor: true,
            fifo: true,
            unit: true,
          },
        },
        type: true,
        item: {
          include: {
            category: true,
          },
        },
      },
    });

    const returnedInventory = sortItemsByTypeAndIdx(inventory, 'type', 'indexPos');

    return res.status(200).json({
      data: returnedInventory,
      message: 'Fetch Inventory Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
