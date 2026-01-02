import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { inventoryCountId, countedQty, inventoryUnitId } = req.body;

    await prisma.$transaction(async (tx) => {
      const existingInventoryCount = await tx.inventoryCount.findUnique({
        where: { id: inventoryCountId },
      });

      if (!existingInventoryCount) {
        return res.status(404).json({ error: 'Inventory count not found' });
      }

      await tx.inventoryCount.update({
        where: { id: inventoryCountId },
        data: { countedQty: countedQty, inventoryUnitId: inventoryUnitId },
      });

      return res
        .status(200)
        .json({ message: 'Inventory report updated successfully' });
    });
  } catch (error: any) {
    console.log('Something went wrong while handling inventory report', error);
    return res.status(500).json({
      error:
        'Something went wrong while handling inventory report: ' +
        error.message,
    });
  }
};

export default withAdminAuthGuard(handler);
