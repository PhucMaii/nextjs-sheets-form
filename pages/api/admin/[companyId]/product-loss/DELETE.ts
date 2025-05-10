import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { manuallyRestockInventoryItemQty } from '@/pages/api/utils/inventoryItem';

interface IQuery {
  id?: string;
}

const prisma = new PrismaClient();

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query as IQuery;

    const existingProductLoss = await prisma.lossReport.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        inventoryItem: true,
        inventoryUnit: true,
      },
    });
    if (!existingProductLoss) {
      return res.status(404).json({
        error: 'Product loss not found',
      });
    }

    await prisma.lossReport.delete({
      where: {
        id: Number(id),
      },
    });

    // TODO: Restock Inventory Items
    await manuallyRestockInventoryItemQty(
      existingProductLoss.inventoryItemId,
      existingProductLoss.quantityLost,
      existingProductLoss.inventoryUnit?.ratio || 1,
    );

    return res.status(200).json({
      message: 'Product loss deleted successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
