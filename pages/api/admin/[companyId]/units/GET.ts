import { getUniqueUnitRatios } from '@/app/utils/array';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  vendorItemId?: string;
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { vendorItemId, inventoryItemId } = req.query as IQuery;

    if (vendorItemId) {
      const units = await prisma.inventoryUnit.findMany({
        where: {
          vendorItemId: Number(vendorItemId),
        },
      });
  
      return res.status(200).json({
        data: units,
        message: 'Fetch Units Successfully',
      });
    } 

    if (inventoryItemId) {
      const units = await prisma.inventoryUnit.findMany({
        where: {
          vendorItem: {
            inventoryItemId: Number(inventoryItemId)
          }
        },
      });

      // get unique units
      const uniqueUnits = getUniqueUnitRatios(units);
  
      return res.status(200).json({
        data: uniqueUnits,
        message: 'Fetch Units Successfully',
      });
    }

    return res.status(404).json({
      error: 'Paramteres Required'
    })
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
