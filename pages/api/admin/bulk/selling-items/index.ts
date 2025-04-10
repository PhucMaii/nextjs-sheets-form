import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { items }: any = req.body;

    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    if (!items) {
      return res.status(404).json({ error: 'Items is required' });
    }

    const itemIds = items.map((item: any) => item.id);

    // Get db items
    const dbItems = await prisma.item.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
      include: {
        category: true,
      },
    });

    if (dbItems.length === 0) {
      return res.status(404).json({ error: 'Items not found' });
    }

    const itemPromises = items.map((item: any) => {
      const dbItem = dbItems.find((dbItem: any) => dbItem.id === item.id);

      if (!dbItem) {
        return res.status(404).json({ error: 'Item not found' });
      }

      if (
        dbItem.name !== item.name ||
        dbItem.price !== item.price ||
        dbItem.prevPrice !== item.prevPrice ||
        dbItem.isShowDiscount !== item.isShowDiscount ||
        dbItem.inventoryUnitId !== item.inventoryUnitId
      ) {
        return prisma.item.update({
          where: {
            id: item.id,
          },
          data: {
            name: item.name,
            price: item.price,
            prevPrice: item.prevPrice,
            isShowDiscount: item.isShowDiscount,
            inventoryUnitId: item.inventoryUnitId,
          },
        });
      }
    });

    const updatedItems = await Promise.all(itemPromises);

    return res.status(200).json({ data: updatedItems, message: 'Update Items Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
