import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import { Order } from '@/app/admin/orders/page';
import { UserType } from '@/app/utils/type';
import { sendInvoiceThroughEmail } from '../../utils/email';
import { groupOrderByMMYYYY } from '../clients/debt';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';

interface IBody {
  client: UserType | null;
  orders: Order[];
  endDate: Date;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();
    const { client, orders, endDate }: IBody = req.body;

    if (!client || !orders || !endDate) {
      return res.status(404).json({
        error: 'Parameters are',
      });
    }

    const formattedEndDate = new Date(endDate);

    const incompletedOrders: any = await prisma.orders.findMany({
      where: {
        userId: client.id,
        status: {
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
      },
      include: {
        items: true,
        user: true,
      },
    });

    const ordersWithItemTotalPrice = incompletedOrders.map((order: Order) => {
      const items = order.items.map((item: any) => {
        const totalPrice = item.price * item.quantity;
        return { ...item, totalPrice };
      });
      return { ...order, items };
    });

    // Group order by mm/yyyy
    const endMonth = YYYYMMDDFormat(formattedEndDate);
    const debtOrders = groupOrderByMMYYYY(incompletedOrders, endMonth);
    const balanceDue = calculateTotalPrice(debtOrders);
    const debtData = { ...debtOrders, 'Balance Due': balanceDue };

    const sortedDebtByMonth = sortKeys(debtData);

    await sendInvoiceThroughEmail(
      client,
      orders,
      { overview: debtData, debtOrders: ordersWithItemTotalPrice },
      sortedDebtByMonth,
    );
    return res.status(200).json({
      message: 'Send Invoice Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);

const calculateTotalPrice = (debtList: any) => {
  const totalPrice = Object.keys(debtList).reduce(
    (acc: number, debtMonth: string) => {
      return acc + debtList[debtMonth];
    },
    0,
  );

  return totalPrice;
};

const sortKeys = (debtList: any) => {
  const sortedKeys = Object.keys(debtList).sort((key1, key2) => {
    const month1 = Number(key1.split('/')[0]);
    const month2 = Number(key2.split('/')[0]);

    return month1 - month2;
  });

  return sortedKeys;
};
