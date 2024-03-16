import { Order } from '@/app/admin/overview/page';
import { YYYYMMDDFormat } from '@/app/utils/time';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient();
  try {
    const { id, status } = req.body as Order;

    if (id) {
      await prisma.orders.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });
      return res.status(200).json({
        message: 'Order Status Updated Successfully',
      });
    }

    const currentDate = new Date();
    const formattedDate = YYYYMMDDFormat(currentDate);
    await prisma.orders.updateMany({
      where: {
        date: formattedDate,
      },
      data: {
        status,
      },
    });

    return res.status(200).json({
      message: 'Order Status Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
