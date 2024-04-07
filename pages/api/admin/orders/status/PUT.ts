import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  try {
    const { id, status, updatedOrders } = req.body as any;

    if (id) {
      await prisma.orders.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      return res.status(200).json({
        message: 'Order Status Updated Successfully',
      });
    }

    for (const order of updatedOrders) {
      await prisma.orders.updateMany({
        where: {
          id: order.id,
        },
        data: {
          status,
        },
      });
    }

    return res.status(200).json({
      message: 'Order Status Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
