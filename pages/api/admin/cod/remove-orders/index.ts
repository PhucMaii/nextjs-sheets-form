import { Order } from '@/app/admin/orders/page';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orders: Order[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'DELETE') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { orders }: IBody = req.body;

    const orderIdList = orders.map((order: Order) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIdList,
        },
      },
      data: {
        codBoardId: null,
      },
    });

    return res.status(200).json({
      message: 'Remove Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
