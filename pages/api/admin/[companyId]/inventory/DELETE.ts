import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Inventory Item Id Not Provided',
      });
    }

    const existingInventoryItem = await prisma.inventoryItem.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingInventoryItem) {
      return res.status(404).json({
        error: 'Inventory Item Not Found',
      });
    }

    await prisma.inventoryItem.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: 'Inventory Item Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
