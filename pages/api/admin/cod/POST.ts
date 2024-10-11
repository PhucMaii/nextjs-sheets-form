import { Order } from '@/app/admin/orders/page';
import { COD_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  createdAt: string;
  createdBy: string;
  date: string;
  note: string;
  cash: number;
  driverId: number;
  orders: Order[];
  skipChecked?: boolean;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      createdAt,
      createdBy,
      date,
      note,
      cash,
      driverId,
      orders,
      skipChecked,
    }: IBody = req.body;

    if (!skipChecked) {
      const existedDriverInDate = await prisma.codBoard.findMany({
        where: {
          date,
          driverId,
        },
      });

      if (existedDriverInDate.length > 0) {
        return res.status(200).json({
          error: 'Driver already in process for ' + date,
        });
      }
    }

    const newCod = await prisma.codBoard.create({
      data: {
        createdAt,
        createdBy,
        date,
        note,
        cash,
        driverId,
        status: COD_STATUS.IN_PROCESS,
      },
    });
    // Convert order list to order ids list
    const orderIds = orders.map((order: Order) => order.id);

    await prisma.orders.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        codBoardId: newCod.id,
      },
    });

    return res.status(200).json({
      data: newCod,
      message: 'New COD Board Added Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
