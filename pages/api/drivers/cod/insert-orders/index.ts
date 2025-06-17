import { Order } from '@/app/admin/[companyId]/orders/page';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { recordAction } from '@/pages/api/utils/timeline';
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
      include: {
        employee: true,
      },
    });

    if (!existingBoard) {
      return res.status(404).json({
        error: 'Cod Board Not Found',
      });
    }

    const orderIdList = orders.map((order: Order) => order.id);
    const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);

    const updatedOrders = await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIdList,
        },
      },
      data: {
        codBoardId: boardId,
        addedToCODBy: createdBy,
      },
    });

    // Record action

    for (const order of orders) {
      await recordAction(
        order.id,
        createdBy,
        `${createdBy} inserted order ${order.id} to COD board of #${existingBoard?.employee?.name}`,
        `### Board: ${existingBoard?.id}\n### Route: ${existingBoard?.employee?.name}\n### Date: ${existingBoard?.date}`,
      );
    }

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
