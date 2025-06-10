import prisma from '@/client';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { companyId } = req.query;
    const { image, inventoryItemId } = req.body;

    if (!companyId || !image) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const existingItem = await prisma.inventoryItem.findUnique({
      where: {
        id: inventoryItemId,
        companyId: Number(companyId),
      },
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { image },
    });

    return res
      .status(200)
      .json({ message: 'Inventory item image updated successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default withAdminAuthGuard(handler);
