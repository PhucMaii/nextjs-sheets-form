import { STOCK_STATUS } from '@/app/utils/enum';
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

    const formattedInventory =
      formatInventoryWithTotalValueAndStatus(inventory);

    return res.status(200).json({
      data: formattedInventory,
      message: 'Fetch Inventory Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error :', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}

export const formatInventoryWithTotalValueAndStatus = (
  inventoryItems: IInventoryItem[],
) => {
  return inventoryItems.map((item) => {
    const stockStatus =
      item.quantity > 5
        ? STOCK_STATUS.IN_STOCK
        : item.quantity === 0
          ? STOCK_STATUS.OUT_OF_STOCK
          : STOCK_STATUS.LOW_STOCK;
    return {
      ...item,
      totalValue: item.quantity * item.unitPrice,
      stockStatus,
    };
  });
};
