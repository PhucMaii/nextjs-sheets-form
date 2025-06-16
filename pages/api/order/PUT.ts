import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '@/app/pusher';
import { generateOrderTemplate } from '@/config/email';
import emailHandler from '../utils/email';
import {
  // generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from '@/pages/api/admin/[companyId]/orderedItems/single';
import {
  categorizeUpdatedItems,
  generateOrderTotalPrice,
  ITEM_CATEGORIZED,
} from '@/pages/api/admin/[companyId]/orderedItems/PUT';
import { formatItemsWithTotalPrice } from '../utils/order';
import { ORDER_STATUS } from '@/app/utils/enum';
import { createOrderedItems } from '../utils/orderedItems';
import { recordAction } from '../utils/timeline';

interface BodyProps {
  deliveryDate: string;
  note: string;
  items: OrderedItems[];
  orderId: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const body = req.body as BodyProps;

    const session: any = await getServerSession(req, res, authOptions);
    const existingUser: any = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const userLastOrder = await prisma.orders.findUnique({
      where: {
        id: body.orderId,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
            inventoryUnit: true,
            fifo: true,
          },
        },
      },
    });

    if (!userLastOrder) {
      return res.status(404).json({
        error: 'Last Order Not Found',
      });
    }

    const newItems = categorizeUpdatedItems(
      userLastOrder?.companyId || -1,
      userLastOrder.items,
      body.items,
    );

    const actionRecord: any = {
      create: [],
      update: [],
      delete: [],
    };

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(
          userLastOrder?.companyId || -1,
          userLastOrder,
          [item],
        );
        actionRecord.create.push(item);
        continue;
      } else if (item.type === ITEM_CATEGORIZED.REMAIN) {
        // REMAIN
        continue;
      } else if (item.type === ITEM_CATEGORIZED.DELETE) {
        // DELETE
        await prisma.orderedItems.delete({
          where: {
            id: item.id,
          },
        });

        actionRecord.delete.push(item);

        if (item?.fifo && item?.inventoryUnit) {
          await restockInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
          );
        }

        continue;
      } else {
        // UPDATE
        // const { cost } = await generateCostAndProfit(item.id);

        const cost =
          (item?.cost / item?.inventoryUnit?.ratio) * item.inventoryUnit.ratio;

        actionRecord.update.push(item);

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit: item.price - cost,
            inventoryUnitId: item.inventoryUnitId,
            option: item.option,
          },
        });

        // Inventory Update
        if (
          item?.fifo &&
          item.inventoryUnit &&
          item?.Orders?.status !== ORDER_STATUS.VOID
        ) {
          await updateSingleInventoryItem(
            item.orderId,
            item.fifo,
            item.inventoryUnit,
            item.quantity,
            item.prevQuantity,
            item?.prevInventoryUnit,
          );
        }
      }
    }

    let comment = '';
    if (actionRecord.create.length > 0) {
      comment += `### Create\n ${actionRecord.create.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }
    if (actionRecord.update.length > 0) {
      comment += `### Update\n ${actionRecord.update.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }
    if (actionRecord.delete.length > 0) {
      comment += `### Remove\n ${actionRecord.delete.map((item: any) => `x${item.quantity} ${item.name}`).join('\n')}\n`;
    }

    await recordAction(userLastOrder.id, `Client - ${existingUser.clientId} edited order`, existingUser.clientId, comment);

    const updatedOrderedItems = await prisma.orderedItems.findMany({
      where: {
        orderId: userLastOrder.id,
      },
      include: {
        inventoryItem: true,
        fifo: true,
        inventoryUnit: true,
      },
    });

    const total = generateOrderTotalPrice(updatedOrderedItems);

    // Apply new total price on order and update note
    const newOrder = await prisma.orders.update({
      where: {
        id: userLastOrder.id,
      },
      data: {
        subTotal: total.subTotal,
        PST: total.PST,
        GST: total.GST,
        totalPrice: total.totalPrice,
        discount: total.discount,
        note: body.note,
        isReplacement: true,
        updateTime: new Date(),
        updatedBy: `Client - ${existingUser.clientId}`,
      },
      include: {
        user: true,
        items: true,
      },
    });

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser.categoryId,
      },
    });

    // Notify Email for admin
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      existingUser.clientName,
      existingUser.clientId,
      // {
      //   ...orderDetails,
      //   'DELIVERY DATE': userLastOrder.deliveryDate,
      //   NOTE: userLastOrder.note,
      //   orderTime: userLastOrder.orderTime,
      // },
      newOrder,
      existingUser.contactNumber,
      existingUser.deliveryAddress,
      newOrder.id,
      'REPLACEMENT ORDER',
    );

    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );

    const itemsWithTotalPrice = formatItemsWithTotalPrice(updatedOrderedItems);

    await pusherServer?.trigger(
      `override-order-${existingUser.companyId}`,
      'incoming-order',
      {
        ...existingUser,
        ...newOrder,
        items: itemsWithTotalPrice,
        totalPrice: newOrder.totalPrice,
        category: userCategory,
        isReplacement: true,
      },
    );

    return res.status(200).json({
      message: 'Override Order Successfully',
      data: {
        ...existingUser,
        ...newOrder,
        items: itemsWithTotalPrice,
        totalPrice: newOrder.totalPrice,
        category: userCategory,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
