// import { IItemPreference, OrderSummary } from "@/app/utils/type";
import { ICartItem } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateOrderTotalPrice } from '../../admin/orderedItems/PUT';
import { getTodayDate } from '../../utils/date';

interface IBody {
  items: ICartItem[];
  userId?: number;
  // orderSummary: OrderSummary;
  note?: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { items, userId, note }: IBody = req.body;

    if (userId) {
      const userExistingCart = await prisma.cart.findFirst({
        where: {
          userId,
        },
      });

      if (userExistingCart) {
        return res.status(400).json({
          error: 'Your cart already existed',
        });
      }
    }

    const formattedTotalItems = items.map((item: ICartItem) => {
      return {
        quantity: item.quantity,
        ...item.itemPreference,
      };
    });

    const total: any = generateOrderTotalPrice(formattedTotalItems);
    // init cart
    const today = getTodayDate();
    const newCart = await prisma.cart.create({
      data: {
        subtotal: total.subTotal,
        PST: total.PST,
        GST: total.GST,
        totalPrice: total.totalPrice,
        discount: total.discount,
        shippingFee: 0,
        userId,
        note,
        createdAt: `${today.date} ${today.time}`,
        createdBy: 'Guest',
      },
    });

    const formattedInputItems = items.map((item: ICartItem) => {
      return {
        quantity: item.quantity,
        itemPreferenceId: item.itemPreferenceId,
        cartId: newCart.id,
        createdAt: `${today.date} ${today.time}`,
        createdBy: 'Guestt',
      };
    });

    await prisma.cartItem.createMany({
      data: formattedInputItems,
    });

    return res.status(201).json({
      data: newCart,
      message: 'New Cart Created Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
