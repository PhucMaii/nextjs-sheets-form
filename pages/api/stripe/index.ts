import { stripe } from '@/app/lib/stripe';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder } from '../admin/orders/POST';
import { convertCartItemsToOrderItems } from '../public/place-order';
import { getTodayDate } from '../utils/date';
import { withGuestSessionGuard } from '../utils/withGuestSessionGuard';
import { calculateShippingFee } from '@/app/utils/shipping';
import { generateLatLng } from '../admin/clients/POST';
import { verifyDeliveryAddress } from '../utils/address';
import { ORDER_STATUS } from '@/app/utils/enum';
// import { generateCostAndProfit } from '../admin/orderedItems/single';

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
  clientData: CheckoutClientData;
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

    if (!cart || !cart.items) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // If cart already had user -> place an order for user and send them to order successful page
    if (cart?.user) {
      // Check if user already order for provided date
      const existingOrder = await prisma.orders.findFirst({
        where: {
          userId: cart?.user?.id,
          deliveryDate: deliveryDate,
          status: {
           not: ORDER_STATUS.VOID 
          }
        },
      });

      if (existingOrder) {
        return res.status(400).json({
          error: 'You already have an order for ' + deliveryDate,
        });
      }

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
      });
    }

    const addressLatAndLng = await generateLatLng(clientData.deliveryAddress);
    const isAddressValid = verifyDeliveryAddress(
      addressLatAndLng.latitude,
      addressLatAndLng.longitude,
    );
    if (!isAddressValid) {
      return res.status(404).json({
        error: 'Delivery address is not valid',
      });
    }

    // Check if user already order for provided date - NOT NOW because user can only place order when they are a pending userx
    // const existingOrder = await prisma.orders.findFirst({
    //   where: {
    //     guestSessionId: clientData?.guestSessionId,
    //     deliveryDate: deliveryDate,
    //   },
    // });

    // if (existingOrder) {
    //   return res.status(400).json({
    //     error: 'You already ordered for ' + deliveryDate,
    //   });
    // }

    // const distanceFromFactory = calculateDistance(
    //   homeLat,
    //   homeLng,
    //   addressLatAndLng.latitude,
    //   addressLatAndLng.longitude,
    // );

    const cartItems = convertCartItemsToOrderItems(cart.items);
    // const totalProfit = calculateCartProfit(cartItems);
    const totalRevenue = cartItems.reduce((acc: number, item: any) => {
      return acc + item.price * item.quantity;
    }, 0);

    const shippingFee = calculateShippingFee(
      isAddressValid.distance,
      totalRevenue,
    );
    // console.log(shippingFee, 'shipping fee');

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXTAUTH_URL}/payment/successful`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      mode: 'payment',
      billing_address_collection: 'auto',
      customer_email: clientData.email,
      currency: 'cad',
      payment_intent_data: {
        metadata: {
          cartId: String(cartId),
          deliveryDate: String(deliveryDate),
          guestSessionId: String(cart?.guestSessionId) || '',
          clientData: JSON.stringify(clientData),
        },
      },
      line_items: [
        ...cart.items.map((item) => ({
          price_data: {
            currency: 'cad',
            product_data: {
              name:
                item.itemPreference?.name ||
                item.itemPreference.inventoryItem.name,
            },
            unit_amount: item.itemPreference.price * 100,
          },
          quantity: item.quantity,
        })),
        // Add shipping fee as an additional line item
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'Shipping Fee',
            },
            unit_amount: Number(shippingFee.toFixed(2)) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        cartId: String(cartId),
        deliveryDate: String(deliveryDate),
        guestSessionId: String(cart?.guestSessionId) || '',
        clientData: JSON.stringify({
          ...clientData,
          deliveryAddress: addressLatAndLng.fullName,
        }),
        shippingFee: String(shippingFee.toFixed(2)),
      },
    });

    return res.status(200).json({
      url: stripeSession.url,
      message: 'Get Stripe Session Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Something went wrong' + error });
  }
};

export default withGuestSessionGuard(handler);

// const calculateCartProfit = async (items: any[]) => {
//   // const orderItems = convertCartItemsToOrderItems(items);
//   // console.log({orderItems, items}, 'order items');

//   let profit = 0;
//   for (const item of items) {
//     // const cost = await generateCostAndProfit(item.id);
//     profit += (item.price - item.inventoryUnit.unitPrice) * item.quantity;
//   }

//   console.log(profit);

//   return profit;
// };
