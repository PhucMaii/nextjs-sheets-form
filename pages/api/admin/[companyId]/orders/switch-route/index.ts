import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { USER_ROLE } from '@/app/utils/enum';
import { NextApiRequest, NextApiResponse } from 'next';
import { ReassignmentStatus } from '@prisma/client';
import { recordAction } from '@/pages/api/utils/timeline';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { orderId, currentRouteId, newRouteId, newIndex, date } = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        reassignment: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const existingNewRoute = await prisma.route.findUnique({
      where: { id: newRouteId },
      include: {
        employee: true,
      },
    });

    if (!existingNewRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // If order has reassignment, update the reassignment
    if (existingOrder.reassignment) {
      await prisma.reassignment.update({
        where: { id: existingOrder.reassignment.id },
        data: {
          toRouteId: newRouteId,
          index: newIndex,
          date,
          reassignedAt: today.dateAndTime,
          reassignedBy: createdBy,
        },
      });

      // Record in order timeline
      await recordAction(
        existingOrder.id,
        createdBy,
        `${createdBy} switched order ${existingOrder.id} to route ${existingNewRoute.name}`,
      );

      return res.status(200).json({ message: 'Order switched successfully' });
    }

    // Else, create a new reassignment
    await prisma.reassignment.create({
      data: {
        index: newIndex,
        date,
        reassignedAt: getTodayDate().dateAndTime,
        reassignedBy: createdBy,
        status: ReassignmentStatus.PENDING,
        fromRouteId: currentRouteId || -1,
        toRouteId: newRouteId,
        orderId: existingOrder.id,
      },
    });

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

export default withAdminAuthGuard(handler);