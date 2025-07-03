import { generateListOfDateString } from '@/app/utils/time';
import { normalizeDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { startDate, endDate, companyId }: IQuery = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    if (!startDate || !endDate) {
      return res.status(404).json({ error: 'You are missing selected date' });
    }

    const normalizedStartDate = normalizeDate(new Date(startDate));
    const normalizedEndDate = normalizeDate(new Date(endDate));
    const deliveryDate = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );

    const orders = await prisma.orders.findMany({
      where: {
        companyId: Number(companyId),
        deliveryDate: {
          in: deliveryDate,
        },
      },
      include: {
        items: {
          where: {
            quantity: {
              gt: 0,
            },
          },
        },
        user: true,
      },
    });

    const invalidOrders = orders
      .map((order) => {
        const hasItems = order.items.length > 0;
        const actualSubtotal = order.items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0,
        );

        const isSubtotalMatch =
          actualSubtotal.toFixed(2) === order.subTotal?.toFixed(2);

        const orderHas0Quantity = order.items.every(
          (item) => item.quantity < 1,
        );

        // return !hasItems || !isSubtotalMatch;
        if (!hasItems) {
          return { ...order, errorType: 'No Items' };
        }

        if (!isSubtotalMatch) {
          return { ...order, errorType: 'Subtotal Mismatch' };
        }

        if (orderHas0Quantity) {
          return { ...order, errorType: 'No Quantity' };
        }

        return null;
      })
      .filter((order) => order !== null);

    return res.status(200).json({
      data: invalidOrders,
      message: 'Fetch Invalid Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
