import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateOrderTotalPrice } from '../orderedItems/PUT';

interface IBody {
  orderId: number;
  customAmount: {
    quantity: number;
    price: number;
    name: string;
  };
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, customAmount }: IBody = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const existingCustomAmount = await prisma.orderedItems.findFirst({
      where: {
        orderId,
        name: customAmount.name,
      },
    });

    if (existingCustomAmount) {
      return res
        .status(400)
        .json({ error: 'Custom Amount Name already exists' });
    }

    const customAmountItem = await prisma.orderedItems.create({
      data: {
        orderId,
        name: customAmount.name,
        price: customAmount.price,
        quantity: customAmount.quantity,
        isCustomAmount: true,
      },
    });

    const newlyAddedCustomAmountOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    // const newOrderTotalPrice = existingOrder.items.reduce((total, item) => {
    //   return total + item.price * item.quantity;
    // }, 0);
    if (!newlyAddedCustomAmountOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderTotal = generateOrderTotalPrice(
      newlyAddedCustomAmountOrder.items,
    );

    await prisma.orders.update({
      where: {
        id: orderId,
      },
      data: {
        totalPrice: orderTotal,
        subTotal: orderTotal.subTotal,
        PST: orderTotal.PST,
        GST: orderTotal.GST,
      },
    });
    return res.status(200).json({
      message: 'Custom Amount Added Successfully',
      data: {
        ...customAmountItem,
        totalPrice: customAmount.price * customAmount.quantity,
      },
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
