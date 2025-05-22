import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '../../admin/[companyId]/orders/POST';
import { checkOrderDeliveryDateValid } from '../../utils/date';
import { createGuest } from '../create-guest';
import { sendEmail, sendWelcomeEmail } from '../../utils/email';
import { ORDER_STATUS, USER_CATEGORIZED } from '@/app/utils/enum';

interface IBody {
  cartId: number;
  userId?: number;
  deliveryDate: string;
  guestSessionId?: string; // temporary
  note: string;
  client: {
    clientName: string;
    deliveryAdress: string;
    contactNumber: string;
    email: string;
    guestSessionId: string;
    guestSessionSignature: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { cartId, userId, guestSessionId, deliveryDate, note }: IBody =
      req.body;

    let user;
    if (!userId && !guestSessionId) {
      user = await createGuest(1, {
        ...req.body.client,
        type: USER_CATEGORIZED.GUEST,
      });
    } else {
      // Verify User
      const queryUser = userId
        ? { id: userId }
        : { guestSessionId: guestSessionId };
      user = await prisma.user.findFirst({
        where: queryUser,
      });

      if (!user) {
        user = await createGuest(1, {
          ...req.body.client,
          type: USER_CATEGORIZED.GUEST,
        });

        await sendWelcomeEmail(user);
      }
    }

    //  Verify delivery date
    const isValidDate = checkOrderDeliveryDateValid(deliveryDate);
    if (!isValidDate.ok) {
      return res.status(400).json({
        error: isValidDate.message,
      });
    }

    // Check items length
    if (!cartId) {
      return res.status(400).json({
        error: 'You have no items in your cart or you not provided cart id',
      });
    }

    // Check has user order for selected date
    const hasOrder = await prisma.orders.findFirst({
      where: {
        userId: user.id,
        deliveryDate,
        status: {
          not: ORDER_STATUS.VOID,
        },
      },
    });

    if (hasOrder) {
      return res.status(400).json({
        error: 'You already have an order for ' + deliveryDate,
      });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: {
          include: {
            item: {
              include: {
                inventoryItem: true,
                inventoryUnit: true,
              },
            },
          },
        },
      },
    });

    // Verify cart item ids passed correctly
    if (!cart) {
      return res.status(400).json({
        error: 'Cart Not Found',
      });
    }

    const cartItems = cart?.items;

    if (cartItems.length === 0) {
      return res.status(400).json({
        error: 'You have no items in your cart or you not provided cart id',
      });
    }
    // Format items to passed to createOrder function
    const formattedItems = convertCartItemsToOrderItems(cartItems);

    // Create order
    // const { date, time } = getTodayDate();
    const newOrder = await createOrder(
      1,
      user,
      formattedItems,
      deliveryDate,
      // `${date} ${time}`,
      `Guest - ${user.clientId}`,
      note,
      0,
      ORDER_STATUS.PENDING,
    );

    // Set guest to pending
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        type: USER_CATEGORIZED.PENDING,
      },
    });

    // Send email
    const isSendToAdmin = true;
    await sendEmail(
      user,
      newOrder,
      newOrder.id,
      newOrder.deliveryDate,
      isSendToAdmin,
      note,
    );

    // Delete cart after place order successfully
    await prisma.cart.delete({
      where: {
        id: cartId,
      },
    });

    return res.status(200).json({
      data: { order: newOrder, user },
      message: 'Order Placed Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}

export const convertCartItemsToOrderItems = (cartItems: any) => {
  const formattedItems = cartItems.map((item: any) => {
    return {
      ...item.item,
      option: {
        name: item?.option?.name,
        price: item?.option?.price,
        ratio: item?.option?.unit?.ratio,
        unitId: item?.option?.unit?.id,
        prevPrice: item?.option?.prevPrice,
        showDiscount: item?.option?.showDiscount,
      },
      quantity: item.quantity,
      price: item?.option?.price || item.item?.price,
      prevPrice: item?.option?.prevPrice || item.item?.prevPrice,
      showDiscount: item?.option?.showDiscount || item.item?.showDiscount,
      name:
        item.item?.name || item?.item?.inventoryItem?.name,
      inventoryUnitId: item?.item?.option?.inventoryUnitId || item.item?.inventoryUnitId,
      inventoryUnit: item?.item?.option?.inventoryUnit || item.item?.inventoryUnit,
    };
  });

  return formattedItems;
};
