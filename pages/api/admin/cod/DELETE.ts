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
                error: 'Cod Id Not Provided',
            });
        }

        const existingBoard = await prisma.codBoard.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                orders: true
            }
        });

        if (!existingBoard) {
            return res.status(404).json({
                error: 'Cod Board Not Found',
            });
        }

        // Remove cod board id in all the orders related
        const orderIds = existingBoard.orders.map(order => order.id);
        await prisma.orders.updateMany({
            where: {
                id: {
                    in: orderIds
                }
            },
            data: {
                codBoardId: null
            }
        });

        const deletedCod = await prisma.codBoard.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({ data: deletedCod, message: 'Delete Board Successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}