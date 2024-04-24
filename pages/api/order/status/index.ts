import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../../utils/withAuthGuard';

interface BodyTypes {
  orderId: number;
  updatedStatus: ORDER_STATUS;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(401).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();
    const { orderId, updatedStatus }: BodyTypes = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order id does not exist',
      });
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        status: updatedStatus,
      },
    });

    return res.status(200).json({
      data: updatedOrder,
      message: 'Order Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
