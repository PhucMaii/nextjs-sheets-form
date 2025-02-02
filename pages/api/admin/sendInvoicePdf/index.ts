import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import { Order } from '@/app/admin/orders/page';
import { UserType } from '@/app/utils/type';
import { sendInvoiceThroughEmail } from '../../utils/email';
import { groupOrderByMMYYYY } from '../clients/debt';
import { generateListOfDateString, YYYYMMDDFormat } from '@/app/utils/time';
import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { normalizeDate } from '../../utils/date';
import { formatItemsWithTotalPrice } from '../../utils/order';

interface IBody {
  client: UserType | null;
  orders: Order[];
  endDate: string;
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
        error: 'Parameters are missing',
      });
    }

    const normalizedStartDate = normalizeDate('01/01/2024');
    const normalizedEndDate = normalizeDate(endDate);

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const incompletedOrders: any = await prisma.orders.findMany({
      where: {
        userId: client.id,
        status: {
          in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED],
        },
        deliveryDate: {
          in: listOfDateString,
        },
      },
      include: {
        items: true,
        user: true,
      },
    });

    const ordersWithItemTotalPrice = incompletedOrders.map((order: Order) => {
      // const items = order.items.map((item: any) => {
      //   let totalPrevPrice = 0;

      //   if (item?.isShowDiscount && item?.prevPrice) {
      //     totalPrevPrice = item.prevPrice * item.quantity;
      //   }
      //   const totalPrice = item.price * item.quantity;
      //   return { ...item, totalPrice, totalPrevPrice };
      // });
      const items = formatItemsWithTotalPrice(order.items);
      return { ...order, items };
    });

    // Group order by mm/yyyy
    const endMonth = YYYYMMDDFormat(normalizedEndDate);
    const debtOrders = groupOrderByMMYYYY(
      incompletedOrders,
      endMonth.split('/')[0],
      endMonth.split('/')[2],
    );
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
