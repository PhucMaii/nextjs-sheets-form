import { ORDER_STATUS, USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { updateSingleInventoryItem } from '../admin/orderedItems/single';
import { sendEmail } from '../utils/email';
import { pusherServer } from '@/app/pusher';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { generateOrderTotalPrice } from '../admin/orderedItems/PUT';
import { checkOrderDeliveryDateValid } from '../utils/date';

export function calculateNextPos(currentPos: number, result: string[]): string {
  const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (currentPos < columns.length) {
    return columns[currentPos];
  }
  result.unshift(columns[currentPos % columns.length]);
  currentPos = Math.floor(currentPos / columns.length) - 1;
  if (currentPos < columns.length) {
    result.unshift(columns[currentPos]);
    return result.join('');
  }
  return calculateNextPos(currentPos, result);
}

export const checkHasClientOrder = async (id: number, deliveryDate: string) => {
  const prisma = new PrismaClient();

  const userOrders = await prisma.orders.findFirst({
    where: {
      userId: id,
      deliveryDate,
      status: {
        in: [
          ORDER_STATUS.COMPLETED,
          ORDER_STATUS.INCOMPLETED,
          ORDER_STATUS.DELIVERED,
        ],
      },
    },
    include: {
      items: true,
    },
  });

  return userOrders;
};

export const overrideOrder = async (
  user: any,
  orderId: number,
  newItems: any,
  newNote: string,
  updatedBy: string,
) => {  
  try {
    const prisma = new PrismaClient();
  
    const order = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });
  
    if (order && updatedBy.split(' - ')[0] === 'Client') {
      const isValidDate = checkOrderDeliveryDateValid(order.deliveryDate);
      if (!isValidDate.ok) {
        throw new Error('Cannot override order for past date');
      }
    }
    let discount = 0;
    const itemList: any = [];
    for (const item of newItems) {
      const existingItem = await prisma.orderedItems.findFirst({
        where: {
          orderId,
          inventoryItemId: item.inventoryItemId,
        },
        include: {
          fifo: true,
          inventoryUnit: true,
        },
      });

      if (!existingItem) {
        continue;
      }
      // Update each item
      const newItem = await prisma.orderedItems.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: item.quantity,
        },
        include: {
          inventoryItem: true,
        },
      });

      // Update new total price
      if (newItem.isShowDiscount && newItem.prevPrice) {
        discount += newItem.quantity * (newItem.prevPrice - newItem.price);
      }

      itemList.push({
        ...newItem,
        totalPrice: newItem.quantity * newItem.price,
      });

      // Update inventory item
      if (existingItem?.fifo && existingItem.inventoryUnit) {
        await updateSingleInventoryItem(
          orderId,
          existingItem.fifo,
          existingItem.inventoryUnit,
          newItem.quantity,
          existingItem.quantity,
        );
      }
    }

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      console.error('Order not found');
      return {ok: false, error: 'Order not found'};
    }

    const total = generateOrderTotalPrice(existingOrder.items);

    const updatedOrder = await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        subTotal: total.subTotal,
        PST: total.PST,
        GST: total.GST,
        totalPrice: total.totalPrice,
        discount,
        note: newNote,
        isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
        updateTime: new Date(),
        updatedBy,
      },
      include: {
        items: true,
      },
    });

    await sendEmail(
      user,
      updatedOrder,
      orderId,
      updatedOrder.deliveryDate,
      true,
      newNote,
    );

    await pusherServer?.trigger('override-order', 'incoming-order', {
      ...updatedOrder,
      items: itemList,
      ...user,
      totalPrice: updatedOrder.totalPrice,
      category: user.category,
      isReplacement: updatedBy.split(' - ')[0] === 'Client' ? true : false,
      id: updatedOrder.id,
    });

    return {ok: true, message: 'Order Override Successfully'};
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return {ok: false, error: error.message};
  }
};

export const getCreatedBy = async (
  req: NextApiRequest,
  res: NextApiResponse,
  createdByRole: USER_ROLE,
) => {
  const prisma = new PrismaClient();
  const session: any = await getServerSession(req, res, authOptions);

  let createdBy = '';

  if (createdByRole === USER_ROLE.DRIVER) {
    const driverCreate: any = await prisma.driver.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    createdBy = `Driver - ${driverCreate.name}`;
  } else if (
    createdByRole === USER_ROLE.ADMIN ||
    createdByRole === USER_ROLE.CLIENT
  ) {
    const userCreate: any = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (userCreate.role === USER_ROLE.ADMIN) {
      createdBy = `Admin - ${userCreate.clientName}`;
    }

    if (userCreate.role === USER_ROLE.CLIENT) {
      createdBy = `Client - ${userCreate.clientId}`;
    }
  }

  return createdBy;
};
