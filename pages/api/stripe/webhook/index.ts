import { stripe } from '@/app/lib/stripe';
import Stripe from 'stripe';
import { createGuest } from '../../public/create-guest';
import { USER_CATEGORIZED } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { createOrder } from '../../admin/orders/POST';
import { convertCartItemsToOrderItems } from '../../public/place-order';
import { getTodayDate } from '../../utils/date';
import { sendEmail, sendWelcomeEmail } from '../../utils/email';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // ⛔ Disable automatic body parsing
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const buf = await buffer(req);
    const webhookSecret =
      'whsec_01a334a8b9bc36bfd9d6d88351918a7e18917556f0e350eab907e01b72d5d062';

    const prisma = new PrismaClient();

    const signature = req.headers['stripe-signature'] as string;
    // const event: Stripe.Event;

    const event: Stripe.Event = stripe.webhooks.constructEvent(
      buf,
      signature,
      webhookSecret,
    );

    const session: any = event.data.object as Stripe.Checkout.Session;

    if (!session.metadata) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    // console.log(session.metadata, 'metadata');
    // console.log(session.payment_intent_data.metadata, 'payment_intent_data.metadata');

    // When payment is complete
    if (event.type === 'checkout.session.completed') {
      // Create guest user
      const clientInfo = JSON.parse(session.metadata.clientData);

      // Convert to pending client
      const newGuest = await createGuest({
        ...clientInfo,
        type: USER_CATEGORIZED.PENDING,
      });

      // Attach to cart
      const cart = await prisma.cart.update({
        where: {
          id: Number(session.metadata.cartId),
        },
        data: {
          userId: newGuest.id,
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

      if (!newGuest) {
        return res.status(404).json({ error: 'Guest not found' });
      }

      const { date, time } = getTodayDate();
      const formattedItems = convertCartItemsToOrderItems(cart.items);
      // Create order
      const newOrder = await createOrder(
        newGuest,
        formattedItems,
        session.metadata.deliveryDate,
        `${date} ${time}`,
        `Client - ${session.metadata.clientId}`,
        Number(session.metadata?.shippingFee) || 0,
      );

      console.log('create order successfully');

      // Set guest to pending
      await prisma.user.update({
        where: {
          id: newGuest.id,
        },
        data: {
          type: USER_CATEGORIZED.PENDING,
        },
      });

      // Send confirmation email
      const isSendToAdmin = true;
      await sendEmail(
        newGuest,
        newOrder,
        newOrder.id,
        newOrder.deliveryDate,
        isSendToAdmin,
        newOrder.note,
      );

      // TODO: Send email confirmation of request to be partner
      await sendWelcomeEmail(newGuest);

      // Delete Cart
      await prisma.cart.delete({
        where: {
          id: Number(session.metadata.cartId),
        },
      });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error: any) {
    console.log('Fail to create checkout session: ', error);
    return res.status(500).json({ error: error.message });
  }
};

export default handler;

// Function to get raw body
const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', reject);
  });
};
