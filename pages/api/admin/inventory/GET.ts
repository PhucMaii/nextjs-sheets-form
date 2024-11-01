import { IInventoryItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const inventory: any = await prisma.inventoryItem.findMany({
      include: {
        vendor: true,
      },
    });

    const formattedInventory = formatInventoryWithTotalValue(inventory);

    return res.status(200).json({
      data: formattedInventory,
      message: 'Fetch Inventory Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export const formatInventoryWithTotalValue = (
  inventoryItems: IInventoryItem[],
) => {
  return inventoryItems.map((item) => {
    return {
      ...item,
      totalValue: item.quantity * item.unitPrice,
    };
  });
};
