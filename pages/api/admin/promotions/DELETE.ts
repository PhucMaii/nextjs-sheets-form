import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'You are missing promotion id',
      });
    }

    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingPromotion) {
      return res.status(404).json({
        error: 'Promotion Not Found',
      });
    }

    // Set all promotion items to null at promotionId
    await prisma.inventoryItem.updateMany({
      where: {
        promotionId: Number(id),
      },
      data: {
        promotionId: null,
      },
    });

    await prisma.promotion.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: 'Promotion deleted successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
