import { stripe } from '@/app/lib/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createGuest } from '../../public/create-guest';
import { USER_CATEGORIZED } from '@/app/utils/enum';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createOrder } from '../../admin/orders/POST';
import { convertCartItemsToOrderItems } from '../../public/place-order';
import { getTodayDate } from '../../utils/date';
import { sendEmail } from '../../utils/email';

const handler = async (req: Request) => {
    if (req.method !== 'POST') {
      return new NextResponse('Your method is not supported', { status: 404 });
    }
  try {
    const body = await req.text();

    const prisma = new PrismaClient();

    const signature = headers().get('Stripe-Signature') as string;

    // const event: Stripe.Event;

    const event: Stripe.Event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );

    const session: any = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata) {
      return new NextResponse('No metadata provided', { status: 400 });
    }

    // When payment is start processing
    if (event.type === 'payment_intent.processing') {
      // Create guest user
      const newGuest = await createGuest({
        ...session.metadata.clientInfo,
        type: USER_CATEGORIZED.GUEST,
      });

      // Attach to cart
      await prisma.cart.update({
        where: {
          id: Number(session.metadata.cartId),
        },
        data: {
          userId: newGuest.id,
        },
      });
    }

    // When payment is complete
    if (event.type === 'payment_intent.succeeded') {
      // Create order
      const cart = await prisma.cart.findUnique({
        where: {
          id: Number(session.metadata.cartId),
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
        return new NextResponse('No cart found', { status: 400 });
      }

      if (!cart.user) {
        return new NextResponse('No user found attach to cart', {
          status: 400,
        });
      }

      const { date, time } = getTodayDate();
      const formattedItems = convertCartItemsToOrderItems(cart.items);
      const newOrder = await createOrder(
        cart.user,
        formattedItems,
        session.metadata.deliveryDate,
        `${date} ${time}`,
        `Client - ${session.metadata.clientId}`,
      );

      // Send confirmation email
      const isSendToAdmin = true;
      await sendEmail(
        cart.user,
        newOrder,
        newOrder.id,
        newOrder.deliveryDate,
        isSendToAdmin,
        newOrder.note,
      )

      // Delete cart
      await prisma.cart.delete({
        where: {
          id: Number(session.metadata.cartId),
        },
      });


    }
  } catch (error: any) {
    console.log('Fail to create checkout session: ', error);
    return new NextResponse(error, { status: 400 });
  }
};

export default handler;