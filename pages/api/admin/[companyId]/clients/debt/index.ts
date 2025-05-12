import { ORDER_STATUS } from '@/app/utils/enum';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { Orders, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  userId?: string;
  endMonth?: string;
  endYear?: string;
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

    const { userId, endMonth, endYear, companyId }: IQuery = req.query;

    if (!userId || !endMonth || !endYear || !companyId) {
      return res.status(404).json({
        error: 'Parameters are missing',
      });
    }

    const incompletedOrders = await prisma.orders.findMany({
      where: {
        userId: Number(userId),
        status: {
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
        companyId: Number(companyId),
      },
    });

    if (incompletedOrders.length === 0) {
      return res.status(200).json({
        data: [],
        message: 'User Has No Debt',
      });
    }

    // Group order by mm/yyyy
    const debtOrdersByMonth = groupOrderByMMYYYY(
      incompletedOrders,
      endMonth,
      endYear,
    );

    return res.status(200).json({
      data: debtOrdersByMonth,
      message: 'Fetch Debt Data Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);

export const groupOrderByMMYYYY = (
  orders: Orders[],
  endMonth: string,
  endYear: string,
) => {
  const validOrders = orders.filter((order: Orders) => {
    const splitDeliveryDate = order.deliveryDate.split('/');

    if (Number(splitDeliveryDate[2]) > Number(endYear)) {
      return false;
    }

    if (
      Number(splitDeliveryDate[0]) > Number(endMonth) &&
      Number(splitDeliveryDate[2]) === Number(endYear)
    ) {
      return false;
    }

    return true;
  });

  const debtOrdersByMonth = validOrders.reduce((acc: any, order: Orders) => {
    const splitDeliveryDate = order.deliveryDate.split('/');
    if (Number(splitDeliveryDate[2]) > Number(endYear)) {
      return acc;
    }

    if (
      Number(splitDeliveryDate[0]) > Number(endMonth) &&
      Number(splitDeliveryDate[2]) === Number(endYear)
    ) {
      return acc;
    }

    // key is mm/yyyy
    const key = `${splitDeliveryDate[0]}/${splitDeliveryDate[2]}`;

    if (!acc[key]) {
      acc[key] = 0;
    }

    acc[key] = acc[key] + order.totalPrice;
    return acc;
  }, {});

  return debtOrdersByMonth;
};
