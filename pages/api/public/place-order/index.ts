import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '../../admin/orders/POST';
import { checkOrderDeliveryDateValid, getTodayDate } from '../../utils/date';
import { createGuest } from '../create-guest';
import { sendEmail } from '../../utils/email';
import { USER_CATEGORIZED } from '@/app/utils/enum';

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
      user = await createGuest(
        {
          ...req.body.client,
          type: USER_CATEGORIZED.GUEST
        }
      );
    } else {
      // Verify User
      const queryUser = userId
        ? { id: userId }
        : { guestSessionId: guestSessionId };
      user = await prisma.user.findFirst({
        where: queryUser,
      });

      if (!user) {
        user = await createGuest({
          ...req.body.client,
          type: USER_CATEGORIZED.GUEST
        });
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

    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: {
          include: {
            inventoryUnit: true,
            itemPreference: {
              include: {
                inventoryItem: true,
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
    const { date, time } = getTodayDate();
    const newOrder = await createOrder(
      user,
      formattedItems,
      deliveryDate,
      `${date} ${time}`,
      `Guest - ${user.clientId}`,
      note,
    );

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
      ...item.itemPreference,
      quantity: item.quantity,
      name:
        item.itemPreference?.name || item.itemPreference.inventoryItem.name,
      inventoryUnitId: item.inventoryUnitId,
      inventoryUnit: item.inventoryUnit,
    };
  });

  return formattedItems;
}