import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    avoidInventory: boolean
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();  

        const { id, avoidInventory }: IBody = req.body;    

        const updatedOrder = await prisma.orders.findUnique({
            where: {
                id
            }
        });

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order Not Found' });
        }

        await prisma.orders.update({
            where: {
                id
            },
            data: {
                avoidInventory
            }
        });

        return res.status(200).json({ message: 'Order Updated Successfully' });

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}