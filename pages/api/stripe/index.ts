import { stripe } from '@/app/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '../admin/orders/POST';
import { convertCartItemsToOrderItems } from '../public/place-order';
import { getTodayDate } from '../utils/date';
import { withGuestSessionGuard } from '../utils/withGuestSessionGuard';

export type CheckoutClientData = {
  guestSessionId: string;
  guestSessionSignature: string;
  email: string;
  name: string;
  contactName: string;
  contactNumber: string;
  deliveryAddress: string;
};

interface IBody {
  cartId: number;
  deliveryDate: string;
  clientData: CheckoutClientData
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    // Only unregistered user are forced to checkout with provided information

    const { cartId, deliveryDate, clientData }: IBody = req.body;

    const cart = await prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        items: {
          include: {
            itemPreference: {
              include: {
                inventoryItem: true,
              },
            },
            inventoryUnit: true,
          },
        },
        user: true,
      },
    });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // If cart already had user -> place an order for user and send them to order successful page
    if (cart?.user) {
      const formattedItems = convertCartItemsToOrderItems(cart.items);

      const { date, time } = getTodayDate();
      const newOrder = createOrder(
        cart.user,
        formattedItems,
        deliveryDate,
        `${date} ${time}`,
        cart?.note || '',
      );

      return res.status(200).json({
        data: newOrder,
        message: 'Place an order successfully',
      })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXTAUTH_URL}/payment/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      mode: 'payment',
      billing_address_collection: 'auto',
      customer_email: clientData.email,
      line_items: cart?.items.map((item) => ({
        price_data: {
          currency: 'cad',
          product_data: {
            name:
              item.itemPreference?.name ||
              item.itemPreference.inventoryItem.name,
            description: `Quantity: ${item.quantity}`,
          },
          unit_amount: item.itemPreference.price * 100,
        },
        quantity: item.quantity,
        metadata: {
          cartId: cartId,
          deliveryDate: deliveryDate,
          guestSessionId: cart?.guestSessionId || '',
          clientData
        },
      })),
    });

    // const stripeSession = await stripe.checkout.sessions.create({
    //   success_url: `${process.env.NEXTAUTH_URL}/success`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
    //   mode: 'payment',
    //   billing_address_collection: 'auto',
    //   customer_email: 'maithienphuc0102@gmail.com',
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'cad',
    //         product_data: {
    //           name: 'BEAN 5 LB',
    //           description: `Quantity: 2`,
    //         },
    //         unit_amount: 1000,
    //       },
    //       quantity: 2,
    //       // metadata: {
    //       //   userId: 1,
    //       //   guestSessionId: 'suchscuudschyfvgir',
    //       // },
    //     },
    //   ],
    // });

    return res.status(200).json({
      url: stripeSession.url,
      message: 'Get Stripe Session Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withGuestSessionGuard(handler);
