import { Order } from '@/app/admin/[companyId]/orders/page';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orders: Order[];
  boardId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(404).json({
      error: 'Your method is not supported',
    });
  }

  try {
    const prisma = new PrismaClient();
    
    const { orders, boardId }: IBody = req.body;

    const orderIdList = orders.map((order: Order) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIdList,
        },
      },
      data: {
        codBoardId: boardId,
      },
    });

    return res.status(200).json({
      message: 'Insert Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
