import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { recordAction } from '@/pages/api/utils/timeline';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IBody {
  id: number;
  isAffectInventory: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, isAffectInventory }: IBody = req.body;

    const updatedOrder = await prisma.orders.findUnique({
      where: {
        id,
      },
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order Not Found' });
    }

    await prisma.orders.update({
      where: {
        id,
      },
      data: {
        isAffectInventory,
      },
    });

    // Record action
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    await recordAction(
      id,
      'System',
      `${createdBy} updated isAffectInventory for order ${id}`,
      `### Affect Inventory\n${updatedOrder?.isAffectInventory} -> ${isAffectInventory}`,
    );

    return res.status(200).json({ message: 'Order Updated Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
