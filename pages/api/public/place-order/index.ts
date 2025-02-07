import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '../../admin/orders/POST';
import { getTodayDate } from '../../utils/date';

interface IBody {
  cartId: number;
  userId?: number;
  deliveryDate: string;
  guestSessionId?: string; // temporary
  phoneNumber: string;
  email: string;
  note: string;
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

    const {
      cartId,
      userId,
      guestSessionId,
      deliveryDate,
      note,
    }: IBody = req.body;

    // If none of authentication is provided -> error
    if (!userId && !guestSessionId) {
      return res.status(400).json({
        error: 'You are not authenticated - No authentication provided',
      });
    }

    // Verify User
    const queryUser = userId ? { id: userId } : { guestSessionId: guestSessionId };
    const existingUser = await prisma.user.findFirst({
      where: queryUser
    });

    if (!existingUser) {
      return res.status(400).json({
        error: 'User Not Found',
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
      }
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
    const formattedItems = cartItems.map((item: any) => {
      return {
        ...item.itemPreference,
        quantity: item.quantity,
        name: item.itemPreference.inventoryItem.name,
        inventoryUnitId: item.inventoryUnitId,
        inventoryUnit: item.inventoryUnit,
      };
    });

    // Create order
    const { date, time } = getTodayDate();
    const newOrder = await createOrder(
      existingUser,
      formattedItems,
      deliveryDate,
      `${date} ${time}`,
      `Guest - ${existingUser.clientId}`,
      note,
    );

    return res
      .status(200)
      .json({ newOrder, message: 'Order Placed Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
