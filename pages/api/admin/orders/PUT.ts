import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyPropTypes {
  orderId: number;
  deliveryDate: string;
  status?: ORDER_STATUS;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { orderId, deliveryDate, status } = req.body as BodyPropTypes;

    const updateData: { deliveryDate: string; status?: ORDER_STATUS } = {
      deliveryDate,
    };

    if (status) {
      updateData.status = status;
    }

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: updateData,
    });

    return res.status(200).json({
      data: updatedOrder,
      message: 'Order Updated Successfully',
    });
  } catch (error: any) {
    console.log('Fail to get order: ', error);
    return res.status(500).json({
      error: 'Fail to get orders: ' + error,
    });
  }
}
