import { Order } from '@/app/admin/[companyId]/orders/page';
import { getDriverInfo } from '@/pages/api/utils/auth';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orders: Order[];
  boardId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const prisma = new PrismaClient();

    const { orders, boardId }: IBody = req.body;

    const existingBoard = await prisma.codBoard.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        error: 'Cod Board Not Found',
      });
    }

    const orderIdList = orders.map((order: Order) => order.id);

    const driver: any = await getDriverInfo(req, res);

    const updatedOrders = await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIdList,
        },
      },
      data: {
        codBoardId: boardId,
        addedToCODBy: `Driver - ${driver?.name}`,
      },
    });

    return res.status(200).json({
      message: 'Insert Order Successfully',
      data: updatedOrders,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
