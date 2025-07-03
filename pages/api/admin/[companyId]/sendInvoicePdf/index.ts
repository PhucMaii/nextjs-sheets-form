import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { Order } from '@/app/admin/[companyId]/orders/page';
import { UserType } from '@/app/utils/type';
import { sendInvoiceThroughEmail } from '@/pages/api/utils/email';
import { groupOrderByMMYYYY } from '../clients/debt';
import { generateListOfDateString, YYYYMMDDFormat } from '@/app/utils/time';
import { ORDER_STATUS } from '@/app/utils/enum';
import { normalizeDate } from '@/pages/api/utils/date';
import { formatItemsWithTotalPrice } from '@/pages/api/utils/order';
import prisma from '@/client';

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

    const { client, orders, endDate }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    if (!client || !orders || !endDate) {
      return res.status(404).json({
        error: 'Parameters are missing',
      });
    }

    const normalizedStartDate = normalizeDate(new Date('01/01/2024'));
    const normalizedEndDate = normalizeDate(new Date(endDate));

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const incompletedOrders: any = await prisma.orders.findMany({
      where: {
        companyId: Number(companyId),
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

export const calculateTotalPrice = (debtList: any) => {
  const totalPrice = Object.keys(debtList).reduce(
    (acc: number, debtMonth: string) => {
      return acc + debtList[debtMonth];
    },
    0,
  );

  return totalPrice;
};

export const sortKeys = (debtList: any) => {
  const sortedKeys = Object.keys(debtList).sort((key1, key2) => {
    const month1 = Number(key1.split('/')[0]);
    const month2 = Number(key2.split('/')[0]);

    return month1 - month2;
  });

  return sortedKeys;
};
