import { ORDER_STATUS } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { pusherServer } from '@/app/pusher';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { generateOrderTemplate } from '@/config/email';
import emailHandler from '../../utils/email';
import { restockInventoryItem } from '../../admin/orderedItems/single';
import { testAccountId } from '@/app/lib/constant';

interface BodyTypes {
  orderId: number;
  updatedStatus: ORDER_STATUS;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    // Updated Status will always be VOID - Delete order button on client side
    const { orderId, updatedStatus }: BodyTypes = req.body;

    let existingUser = await prisma.user.findUnique({
      where: {
        id: testAccountId,
      },
    });

    if (!req.query.test) {
      const session: any = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }

      existingUser = await prisma.user.findUnique({
        where: {
          id: Number(session.user.id),
        },
      });
    }

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            fifo: true,
            inventoryUnit: true,
          },
        },
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
        isVoid: true,
        updateTime: new Date(),
        updatedBy: `Client - ${existingUser.clientName}`,
      },
      include: {
        items: true,
      },
    });

    let total = 0;
    const itemList: any = [];
    const orderDetails: any = {};

    for (const item of existingOrder.items) {
      // Update each item
      const newItem = await prisma.orderedItems.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: item.quantity,
        },
      });

      // Update new total price
      total += newItem.quantity * newItem.price;
      itemList.push({
        ...newItem,
        totalPrice: newItem.quantity * newItem.price,
      });

      if (
        existingOrder.status !== ORDER_STATUS.VOID &&
        updatedStatus === ORDER_STATUS.VOID
      ) {
        // Restock inventory item
        if (item?.fifo && item?.inventoryUnit) {
          await restockInventoryItem(
            orderId,
            item.fifo,
            item?.inventoryUnit,
            item.quantity,
          );
        }
      }

      // Format order to send email
      orderDetails[item.name] = {
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
      };
    }

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser?.categoryId || -1,
      },
    });

    // Notify Email for admin
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      existingUser.clientName,
      existingUser.clientId,
      // {
      //   ...orderDetails,
      //   'DELIVERY DATE': existingOrder.deliveryDate,
      //   NOTE: existingOrder.note,
      //   orderTime: existingOrder.orderTime,
      // },
      updatedOrder,
      existingUser.contactNumber,
      existingUser.deliveryAddress,
      existingOrder.id,
      'VOID ORDER',
    );

    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );

    await pusherServer?.trigger('void-order', 'incoming-order', {
      ...existingUser,
      ...existingOrder,
      items: itemList,
      totalPrice: total,
      category: userCategory,
      isVoid: true,
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

export default handler;
