import { Order } from '@/app/admin/[companyId]/orders/page';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { USER_ROLE } from '@/app/utils/enum';
import { recordAction } from '@/pages/api/utils/timeline';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IBody {
  orders: Order[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'DELETE') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { orders }: IBody = req.body;

    const orderIdList = orders.map((order: Order) => order.id);

    const removedOrders = await prisma.orders.findMany({
      where: {
        id: {
          in: orderIdList,
        },
      },
      include: {
        CodBoard: {
          include: {
            employee: true,
          },
        },
      },
    });

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

    // Record action
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    for (const order of removedOrders) {
      await recordAction(
        order.id,
        'System',
        `Remove order from COD board of #${order.CodBoard?.employee?.name} manually by ${createdBy}`,
        `### Board: ${order.CodBoard?.id}\n### Route: ${order.CodBoard?.employee?.name}\n### Date: ${order?.CodBoard?.date}`,
      );
    }

    return res.status(200).json({
      message: 'Remove Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
