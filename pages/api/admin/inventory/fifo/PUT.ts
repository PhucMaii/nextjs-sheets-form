import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { fifoId, updatedQuantity } = req.body;

        const existingFifo = await prisma.fifo.findUnique({
            where: {
                id: fifoId,
            },
        });

        
        if (!existingFifo) {
            return res.status(404).json({
                error: 'FIFO Id Not Found',
            });
        }
        
        console.log('existingFifo: ', {existingFifo, updatedQuantity});
        await prisma.fifo.update({
            where: {
                id: fifoId,
            },
            data: {
                quantity: updatedQuantity,
            },
        });

        return res.status(200).json({
            message: 'FIFO Updated Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}