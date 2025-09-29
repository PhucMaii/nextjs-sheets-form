import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { recordAction } from '@/pages/api/utils/timeline';
import { ReassignmentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  orderId: number;
  newRouteId: number;
  currentRouteId: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const { orderId, newRouteId, currentRouteId } = req.body as IBody;

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const existingNewRoute = await prisma.route.findUnique({
      where: { id: newRouteId },
    });

    if (!existingNewRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // Check if order is already has reassignment
    const existingReassignment = await prisma.reassignment.findUnique({
      where: { orderId },
    });

    const createdBy = await getCreatedBy(req, res, USER_ROLE.DRIVER);
    const today = getTodayDate();

    // If order has reassignment, update the reassignment
    if (existingReassignment) {
      await prisma.reassignment.update({
        where: { id: existingReassignment.id },
        data: {
          toRouteId: newRouteId,
          fromRouteId: currentRouteId,
          index: -1,
          date: existingOrder.deliveryDate,
          reassignedAt: today.dateAndTime,
          reassignedBy: createdBy,
          status: ReassignmentStatus.PENDING,
        },
      });
    } else {
      await prisma.reassignment.create({
        data: {
          orderId,
          toRouteId: newRouteId,
          fromRouteId: currentRouteId,
          index: -1,
          date: existingOrder.deliveryDate,
          reassignedAt: today.dateAndTime,
          reassignedBy: createdBy,
          status: ReassignmentStatus.PENDING,
        },
      });
    }

    // Record in order timeline
    await recordAction(
      existingOrder.id,
      createdBy,
      `${createdBy} switched order ${existingOrder.id} to route ${existingNewRoute.name}`,
    );

    return res.status(200).json({ message: 'Order switched successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default handler;
