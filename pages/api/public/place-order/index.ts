import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyDeliveryAddress } from '../../utils/address';
import { generateLatLng } from '../../admin/clients/POST';
import { createOrder } from '../../admin/orders/POST';
import { getTodayDate } from '../../utils/date';

interface IBody {
  cartItemIds: number[];
  userId: number;
  deliveryAddress: string;
  deliveryDate: string;
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
      cartItemIds,
      userId,
      deliveryAddress,
      deliveryDate,
      note,
    }: IBody = req.body;

    // If none of authentication is provided -> error
    if (!userId) {
      return res.status(400).json({
        error: 'You are not authenticated - No authentication provided',
      });
    }

    // If userId is provided -> check if user exists
    // if (userId) {
    //   const existingUser = await prisma.user.findUnique({
    //     where: {
    //       id: userId,
    //     },
    //   });

    //   if (!existingUser) {
    //     return res.status(400).json({
    //       error: 'User Not Found',
    //     });
    //   }

    //   authenticatedField.userId = userId;
    // } else if (guestSessionId && guestSessionSignature) {
    //   // Else if user not logged in -> check if guest session is valid
    //   const isSessionValid = verifySessionId(
    //     guestSessionId,
    //     guestSessionSignature,
    //   );

    //   if (!isSessionValid) {
    //     return res.status(400).json({
    //       error: 'You are not authenticated',
    //     });
    //   }

    //   authenticatedField.guestSessionId = guestSessionId;
    // }

    // Verify User
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(400).json({
        error: 'User Not Found',
      });
    }

    // Check if delivery address is valid
    const address = await generateLatLng(deliveryAddress);
    const isDeliveryAddressValid = verifyDeliveryAddress(
      address.latitude,
      address.longitude,
    );

    if (!isDeliveryAddressValid) {
      return res.status(400).json({
        error: 'Sorry, we are unable to deliver to your provided address',
      });
    }

    // Check items length
    if (cartItemIds.length === 0) {
      return res.status(400).json({
        error: 'You have no items in your cart',
      });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: {
        id: {
          in: cartItemIds,
        },
      },
      include: {
        inventoryUnit: true,
        itemPreference: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // Verify cart item ids passed correctly
    if (cartItems.length !== cartItemIds.length) {
      return res.status(400).json({
        error: 'You have items in your cart that do not exist',
      });
    }

    // Format items to passed to createOrder function
    const formattedItems = cartItems.map((item: any) => {
      return {
        ...item.itemPreference,
        quantity: item.quantity,
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
