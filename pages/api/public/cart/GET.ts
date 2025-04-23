import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../utils/date';
import {
  generateGuestSessionId,
  generateSessionSignature,
  verifySessionId,
} from '@/app/utils/security';

interface IQuery {
  guestSessionId?: string;
  guestSessionSignature?: string;
  cartId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { cartId, guestSessionId, guestSessionSignature }: IQuery = req.query;

    if (cartId) {
      const existingCart = await prisma.cart.findUnique({
        where: {
          id: Number(cartId),
        },
        include: {
          items: {
            include: {
              item: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      });

      if (existingCart) {
        return res.status(200).json({
          data: existingCart,
          message: 'Fetch Cart By Cart Id Successfully',
        });
      }
    }

    if (guestSessionId) {
      // const whereClause: any = {};
      // if (userId) {
      //   whereClause['userId'] = Number(userId);
      // } else if (guestSessionId && guestSessionSignature) {
      //   // Case for guest session
      //   // Verify guest session id
      //   const isSessionValid = verifySessionId(guestSessionId, guestSessionSignature);

      //   if (isSessionValid) {
      //     whereClause['guestSessionId'] = guestSessionId;
      //   }
      // }

      const userCart = await prisma.cart.findFirst({
        where: { guestSessionId },
        include: {
          items: {
            include: {
              item: {
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

      // CASE: guest session id is not valid or not have cart
      // Verify guest session id
      let sessionId = guestSessionId;
      let sessionSignature = guestSessionSignature;

      // If session id is not available, create new one
      if (!sessionId || !sessionSignature) {
        sessionId = generateGuestSessionId();
        sessionSignature = generateSessionSignature(sessionId);
      } else {
        // If session id is available, verify
        const isSessionValid = verifySessionId(sessionId, sessionSignature);

        // If invalid, create new one and return it to client
        if (!isSessionValid) {
          sessionId = generateGuestSessionId();
          sessionSignature = generateSessionSignature(sessionId);
        }
      }

      const today = getTodayDate();
      const newCart = await prisma.cart.create({
        data: {
          guestSessionId: sessionId,
          shippingFee: 0,
          discount: 0,
          PST: 0,
          GST: 0,
          totalPrice: 0,
          subtotal: 0,
          createdAt: `${today.date} ${today.time}`,
          createdBy: 'Guest',
        },
      });
      return res.status(200).json({
        data: newCart,
        guestSessionId: sessionId,
        guestSessionSignature: sessionSignature,
        message: 'Create New Cart Successfully',
      });
    }

    return res.status(404).json({
      error: 'You are missing query key',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
