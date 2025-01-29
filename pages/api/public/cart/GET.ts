import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  userId?: string;
  cartId?: string;
  ipAddress?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId, cartId }: IQuery = req.query;

    if (userId) {
      const userCart = await prisma.cart.findFirst({
        where: {
          userId: Number(userId),
        },
        include: {
          items: {
            include: {
              itemPreference: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      });

      if (userCart) {
        return res.status(200).json({
          data: userCart,
          message: 'Fetch Cart By User Id Successfully',
        });
      }
    }

    if (cartId) {
      const cart = await prisma.cart.findUnique({
        where: {
          id: Number(cartId),
        },
        include: {
          items: {
            include: {
              itemPreference: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      });

      if (cart) {
        return res.status(200).json({
          data: cart,
          message: 'Fetch Cart By Id Successfullt',
        });
      }
    }

    // If there is no params provided or user hasn't had cart yet
    // -> Create cart

    // const today = getTodayDate();
    // const newCart = await prisma.cart.create({
    //     data: {
    //         userId: userId ? Number(userId) : null,
    //         note: '',
    //         subtotal: 0,
    //         PST: 0,
    //         GST: 0,
    //         discount: 0,
    //         shippingFee: 0,
    //         totalPrice: 0,
    //         createdAt: `${today.date} ${today.time}`,
    //         createdBy: `Guest - ${ipAddress}`
    //     }
    // });

    return res.status(200).json({
      message: 'Create New Cart Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
