import { Order } from '@/app/admin/orders/page';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orders: Order[];
}

const handler = async(
  req: NextApiRequest,
  res: NextApiResponse,
) => {
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

export default withAdminAuthGuard(handler)