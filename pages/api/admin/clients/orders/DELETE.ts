import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface BodyTypes {
    orderId: number;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { orderId } = req.body as BodyTypes;

        const existingOrder = await prisma.orders.findUnique({
            where: {
                id: orderId
            }

        });

        if (!existingOrder) {
            return res.status(404).json({
                error: 'Order Not Found'
            })
        }

        await prisma.orders.delete({
            where: {
                id: orderId
            }
        });

        return res.status(200).json({
            message: 'Order Deleted Successfully'
        })

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}