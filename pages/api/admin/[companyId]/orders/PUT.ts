import { InventoryLogFrom, InventoryLogType } from '@prisma/client';
import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import {
  // restockInventoryItem,
  subtractInventoryItem,
} from '../orderedItems/single';
import { USER_ROLE } from '@/app/utils/enum';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate } from '@/pages/api/utils/date';
import { recordOrderInventoryLog } from '@/pages/api/utils/logs';

interface BodyPropTypes {
  orderId: number;
  deliveryDate?: string;
  note?: string;
  isAffectInventory?: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { orderId, deliveryDate, note, isAffectInventory } =
      req.body as BodyPropTypes;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({
        error: 'No Order Found',
      });
    }

    const updateData: any = {};
    let comment: string = ''; // Comment of order action
    if (deliveryDate) {
      updateData.deliveryDate = deliveryDate;
      comment += `Delivery date\n${existingOrder.deliveryDate} -> ${deliveryDate}\n`;
    }

    if (note) {
      updateData.note = note;
      comment += `Note\n${note}\n`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No Data To Update',
      });
    }

    // Get person update info
    const session: any = await getServerSession(req, res, authOptions);
    const adminUpdate: any = session?.user;

    const updateTime = new Date();
    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        ...updateData,
        updatedBy: `Admin - ${adminUpdate.name}`,
        updateTime,
        isVoid: false,
      },
      include: {
        items: {
          include: {
            fifo: {
              include: {
                inventoryItem: true,
              },
            },
            inventoryUnit: true,
          },
        },
      },
    });

    let existingTimeline = await prisma.orderTimeline.findFirst({
      where: {
        orderId,
      },
      include: {
        actions: true,
      },
    });

    if (!existingTimeline) {
      existingTimeline = await prisma.orderTimeline.create({
        data: {
          orderId,
        },
        include: {
          actions: true,
        },
      });
    }

    const today = getTodayDate();
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // Create order action of update delivery date
    await prisma.orderAction.create({
      data: {
        timelineId: existingTimeline.id,
        title: `${createdBy} edited this order`,
        comment,
        createdAt: today.dateAndTime,
        createdBy: createdBy,
        posIndex: existingTimeline.actions.length + 1,
      },
    });

    if (
      isAffectInventory &&
      updateData.deliveryDate &&
      !updatedOrder.hasSubtractInventory
    ) {
      for (const item of updatedOrder.items) {
        if (item?.fifo && item?.inventoryUnit) {
          await subtractInventoryItem(
            orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );

          // record inventory log
          await recordOrderInventoryLog(
            orderId,
            item.fifo.inventoryItemId,
            item.quantity,
            InventoryLogType.SUBTRACT,
            InventoryLogFrom.EDIT_ORDER,
            `Subtract ${item.quantity} ${item.fifo.inventoryItem.name} from inventory due to order ${orderId} delivery date from ${existingOrder.deliveryDate} to ${deliveryDate} update`,
          );
        }
      }
    }

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
