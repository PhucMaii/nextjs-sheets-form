import { OrderedItems, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '@/app/pusher';
import { generateOrderTemplate } from '@/config/email';
import emailHandler from '../utils/email';
import {
  generateCostAndProfit,
  restockInventoryItem,
  updateSingleInventoryItem,
} from '../admin/orderedItems/single';
import {
  categorizeUpdatedItems,
  generateOrderTotalPrice,
  ITEM_CATEGORIZED,
} from '../admin/orderedItems/PUT';
import { formatItemsWithTotalPrice } from '../utils/order';
import { ORDER_STATUS } from '@/app/utils/enum';
import { createOrderedItems } from '../utils/orderedItems';

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

    const newItems = categorizeUpdatedItems(userLastOrder.items, body.items);

    console.log(newItems, 'acutalUpdatedItems');

    for (const item of newItems) {
      // Check item categorize to create, update or delete

      // CREATE
      if (item.type === ITEM_CATEGORIZED.CREATE) {
        await createOrderedItems(userLastOrder, [item]);
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
        const { cost } = await generateCostAndProfit(item.id);

        await prisma.orderedItems.update({
          where: {
            id: item.id,
          },
          data: {
            price: item.price,
            quantity: item.quantity,
            cost,
            profit: item.price - cost,
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
            item.quantity,
          );
        }
      }
    }

    // for (const item of body.items) {
    //   const existingItem = await prisma.orderedItems.findUnique({
    //     where: {
    //       id: item.id,
    //     },
    //     include: {
    //       fifo: true,
    //       inventoryUnit: true,
    //     },
    //   });

    //   if (!existingItem) {
    //     return res.status(404).json({
    //       error: 'Item Not Found',
    //     });
    //   }

    //   // Update each item
    //   const newItem = await prisma.orderedItems.update({
    //     where: {
    //       id: item.id,
    //     },
    //     data: {
    //       quantity: item.quantity,
    //     },
    //     include: {
    //       fifo: true,
    //       inventoryItem: true,
    //     },
    //   });

    //   // Update new total price
    //   // total += newItem.quantity * newItem.price;
    //   if (newItem.isShowDiscount && newItem.prevPrice) {
    //     discount += newItem.quantity * (newItem.prevPrice - newItem.price);
    //   }
    //   subTotal += newItem.quantity * newItem.price;
    //   // (newItem?.isShowDiscount && newItem?.prevPrice
    //   //   ? newItem.prevPrice
    //   //   : newItem.price);
    //   if (newItem.inventoryItem) {
    //     if (newItem.inventoryItem.hasPST) {
    //       PST += newItem.quantity * newItem.price * pstRate;
    //     }

    //     if (newItem.inventoryItem.hasGST) {
    //       GST += newItem.quantity * newItem.price * gstRate;
    //     }
    //   }
    //   itemList.push({
    //     ...newItem,
    //     totalPrice: newItem.quantity * newItem.price,
    //   });

    //   // Update Inventory Item
    //   if (existingItem?.fifo && existingItem?.inventoryUnit) {
    //     await updateSingleInventoryItem(
    //       body.orderId,
    //       existingItem.fifo,
    //       existingItem.inventoryUnit,
    //       newItem.quantity,
    //       existingItem.quantity,
    //     );
    //   }

    //   // Format order to send email
    //   orderDetails[item.name] = {
    //     quantity: item.quantity,
    //     price: item.price,
    //     totalPrice: item.quantity * item.price,
    //   };
    // }

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

    await pusherServer?.trigger('override-order', 'incoming-order', {
      ...existingUser,
      ...newOrder,
      items: itemsWithTotalPrice,
      totalPrice: newOrder.totalPrice,
      category: userCategory,
      isReplacement: true,
    });

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
