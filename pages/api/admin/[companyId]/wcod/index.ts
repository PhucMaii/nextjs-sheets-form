import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { Orders, PrismaClient } from '@prisma/client';
import { generate7DaysBefore } from '@/pages/api/utils/date';
import { ORDER_STATUS } from '@/app/utils/enum';

interface IQuery {
  clientIdList?: string;
  date?: string;
  companyId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { clientIdList, date, companyId }: IQuery = req.query;

    if (!clientIdList || !date || clientIdList.length === 0 || !companyId) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const dayList = generate7DaysBefore(date);

    const parsedClientIds = clientIdList
      .split(',')
      .map((id: string) => parseInt(id));
    const wcodOrders = await prisma.orders.findMany({
      where: {
        userId: {
          in: parsedClientIds,
        },
        deliveryDate: {
          in: dayList,
        },
        status: {
          not: ORDER_STATUS.VOID,
        },
        companyId: Number(companyId),
      },
      include: {
        user: {
          include: {
            preference: true,
          },
        },
      },
    });

    const wcodBill = wcodOrders.reduce((acc: number, order: Orders) => {
      return acc + order.totalPrice;
    }, 0);

    return res.status(200).json({
      data: { wcodBill, wcodOrders },
      message: 'Fetch WCOD Total Price Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
