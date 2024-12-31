import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    orderId: number;
    customAmount: {
        quantity: number;
        price: number;
        name: string;
    }
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

        const existingCustomAmount = await prisma.orderedItems.findFirst({
            where: {
                orderId,
                name: customAmount.name,
            },
        });

        if (existingCustomAmount) {
            return res.status(400).json({ error: 'Custom Amount Name already exists' });
        }

        await prisma.orderedItems.create({
            data: {
                orderId,
                name: customAmount.name,
                price: customAmount.price,
                quantity: customAmount.quantity,
            }
        });

        return res.status(200).json({ message: 'Custom Amount Added Successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}