import { USER_ROLE } from '@/app/utils/enum';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { recordAction } from '@/pages/api/utils/timeline';
import withDriverAuthGuard from '@/pages/api/utils/withDriverAuthGuar';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  orderId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'DELETE') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { orderId }: IQuery = req.query;

    if (!orderId) {
      return res.status(404).json({ error: 'Order Id is missing' });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: Number(orderId),
      },
      include: {
        CodBoard: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await prisma.orders.update({
      where: {
        id: Number(orderId),
      },
      data: {
        codBoardId: null,
      },
    });

    // Record action
    const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);
    await recordAction(
      Number(orderId),
      createdBy,
      `${createdBy} removed order ${orderId} from COD board of #${existingOrder?.CodBoard?.employee?.name}`,
      `### Board: ${existingOrder?.CodBoard?.id}\n### Route: ${existingOrder?.CodBoard?.employee?.name}\n### Date: ${existingOrder?.CodBoard?.date}`,
    );

    return res.status(200).json({ message: 'Remove Order Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withDriverAuthGuard(handler);
