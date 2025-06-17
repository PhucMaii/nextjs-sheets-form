import { API_URL, USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { recordAction } from '@/pages/api/utils/timeline';
import { C } from '@fullcalendar/core/internal-common';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  notes: string;
  orderId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;
    const { notes, orderId } = req.body as IBody;

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const newOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        note: notes,
      },
    });

    // record action
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);
    await recordAction(
      existingOrder.id,
      `${createdBy} updated notes for order ${existingOrder.id}`,
      createdBy,
      `### Note: ${existingOrder.note} -> ${notes}`,
    );

    return res.status(200).json({
      data: newOrder,
      message: 'Notes updated successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
