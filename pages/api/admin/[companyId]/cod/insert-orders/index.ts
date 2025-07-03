import { Order } from '@/app/admin/[companyId]/orders/page';
import { USER_ROLE } from '@/app/utils/enum';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { recordAction } from '@/pages/api/utils/timeline';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

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

    const board = await prisma.codBoard.findUnique({
      where: {
        id: boardId,
      },
      include: {
        employee: true,
      },
    });

    // loop through orderIdList and record action
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    for (const orderId of orderIdList) {
      await recordAction(
        orderId,
        createdBy,
        `${createdBy} added order ${orderId} to board ${boardId} manually`,
        `### Board: ${boardId}\n### Route: ${board?.employee?.name}`,
      );
    }

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
