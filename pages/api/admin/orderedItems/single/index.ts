import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../../utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { updateOrderTotalPrice } from '../PUT';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();
    const { id, orderId, quantity, price, orderTotalPrice } = req.body as any;

    const data = await prisma.orderedItems.update({
      where: {
        id,
      },
      data: {
        quantity,
        price,
      },
    });

    await updateOrderTotalPrice(orderId, orderTotalPrice);

    return res.status(200).json({
      data,
      message: 'Update Data Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withAdminAuthGuard(handler);
