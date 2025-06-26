import prisma from '@/client';
import { getDriverInfo } from '@/pages/api/utils/auth';
import { getTodayDate } from '@/pages/api/utils/date';
import withEmployeeAuthGuard from '@/pages/api/utils/withEmployeeAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(404).json({ message: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body as IBody;

    const driver: any = await getDriverInfo(req, res);

    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
      include: {
        delivery: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create delivery
    const today = getTodayDate();
    if (!order.delivery) {
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          employeeId: driver.id,
          startTripAt: today.dateAndTime,
          companyId: order.companyId,
        },
      });
    } else {
      await prisma.delivery.update({
        where: { id: order.delivery.id },
        data: {
          deliveredAt: today.dateAndTime,
        },
      });
    }

    return res.status(200).json({ message: 'Delivery started' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default withEmployeeAuthGuard(handler);