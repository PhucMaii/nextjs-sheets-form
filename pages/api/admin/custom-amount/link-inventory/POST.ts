import { ICustomAmount } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { createOrderedItems } from "../../orders/POST";
import { generateOrderTotalPrice } from "../../orderedItems/PUT";

interface IBody {
  orderId: number;
  customAmount: ICustomAmount;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { orderId, customAmount }: IBody = req.body;

    const existingOrder = await prisma.orders.findUnique({
      where: {
        id: orderId,
      },
    });

        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderedItems = await createOrderedItems(existingOrder, [customAmount]);

        // Generate total price order newly added custom amount order
        const newlyAddedCustomAmountOrder = await prisma.orders.findUnique({
            where: {
                id: orderId,
            },
            include: {
                items: {
                    include: {
                        inventoryItem: true,
                    }
                },
            }
        });

        if (!newlyAddedCustomAmountOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const orderTotal = generateOrderTotalPrice(newlyAddedCustomAmountOrder.items);

        await prisma.orders.update({
            where: {
                id: orderId,
            },
            data: {
                totalPrice: orderTotal,
                subTotal: orderTotal.subTotal,
                PST: orderTotal.PST,
                GST: orderTotal.GST,
            }
        });

        const targetItem = orderedItems[0];

        const addedItem = await prisma.orderedItems.findFirst({
            where: {
                orderId: targetItem.orderId,
                name: targetItem.name,
                price: targetItem.price,
                quantity: targetItem.quantity,
                inventoryItemId: targetItem.inventoryItemId,
                inventoryUnitId: targetItem.inventoryUnitId
            },
            include: {
                fifo: true,
                inventoryUnit: true,
            }
        });

        if (!addedItem) {
            return res.status(404).json({ error: 'Conflict add item not found' });
        }

        return res.status(200).json({ data: {...addedItem, totalPrice: addedItem.price * addedItem.quantity}, message: 'Add Custom Amount Successfully' });

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}
