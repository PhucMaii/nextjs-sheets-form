import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import prisma from '@/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'Item IDs array is required' });
    }

    await prisma.inventoryItem.updateMany({
      where: {
        id: { in: itemIds },
        companyId: Number(companyId),
      },
      data: {
        isAllowedToCount: true,
      },
    });

    const isAllowedToCountItem = await prisma.inventoryItem.findMany({
      where: {
        isAllowedToCount: true,
        companyId: Number(companyId),
      },
    });

    // Filter out itemIds that are not in itemIds params
    const notAllowedToCountItemIds = isAllowedToCountItem.filter((item) => !itemIds.includes(item.id));

    if (notAllowedToCountItemIds.length > 0) {
    await prisma.inventoryItem.updateMany({
      where: {
        id: { in: notAllowedToCountItemIds.map((item) => item.id) },
        companyId: Number(companyId),
      },
      data: {
          isAllowedToCount: false,
        },
      });
    }

    return res.status(200).json({
      message: 'Allowed count items updated successfully',
    });
    
  } catch (error) {
    console.error('Something went wrong, save allowed count:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);