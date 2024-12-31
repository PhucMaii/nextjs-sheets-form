import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    id?: string;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id }: IQuery = req.query;

        if (!id) {
            return res.status(404).json({
                error: 'Ordered Item Id Not Provided',
            });
        }

        const existingItem = await prisma.orderedItems.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existingItem) {
            return res.status(404).json({
                error: 'Ordered Item Not Found',
            });
        }

        await prisma.orderedItems.delete({
            where: {
                id: existingItem.id,
            },
        });

        return res.status(200).json({
            message: 'Ordered Item Deleted Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}