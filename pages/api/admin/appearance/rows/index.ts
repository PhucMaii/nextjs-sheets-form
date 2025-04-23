import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export enum ROW_ACTION {
  ADD = 'add',
  REMOVE = 'remove',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { typeId, rowAction, quantity } = req.body;

    const actualId = Number(typeId?.split(' - ')[1]);
    const isPromotion = typeId.includes('promotion');

    let container;
    // Handle Promotion
    if (isPromotion) {
      container = await prisma.promotion.findUnique({
        where: {
          id: actualId,
          isWebsite: false,
        },
        include: {
          items: {
            orderBy: {},
          },
        },
      });
    } else {
      container = await prisma.itemType.findUnique({
        where: {
          id: actualId,
        },
      });
    }

    if (!container) {
      return res.status(404).json({ error: 'Container To Update Not Found' });
    }

    let newRows: number = container?.rows || 1;

    if (rowAction === ROW_ACTION.ADD) {
      newRows += quantity;
    } else if (rowAction === ROW_ACTION.REMOVE) {
      newRows -= quantity;
    } else {
      return res.status(404).json({ error: 'Invalid Row Action' });
    }

    if (isPromotion) {
      await prisma.promotion.update({
        where: {
          id: actualId,
        },
        data: {
          rows: newRows,
        },
      });
    } else {
      await prisma.itemType.update({
        where: {
          id: actualId,
        },
        data: {
          rows: newRows,
        },
      });
    }

    return res
      .status(200)
      .json({ data: newRows, message: 'Rows Updated Successfully' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
