import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { updateCartTotalPrice } from '../add-to-cart';

interface IBody {
  itemId: number;
  quantity: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();

    const { quantity, itemId }: IBody = req.body;

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!existingCartItem) {
      return res.status(404).json({
        error: 'Cart Item Not Found',
      });
    }

    await prisma.cartItem.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
    });

    // Update cart total price after adjusted in item
    const updatedCart = await updateCartTotalPrice(existingCartItem.cartId);

    return res.status(200).json({
      data: updatedCart,
      message: 'Item Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
