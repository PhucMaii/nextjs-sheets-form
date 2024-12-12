import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id }: IQuery = req.query;

        if (!id) {
            return res.status(404).json({
                error: 'FIFO Id Not Provided',
            });
        }

        if (Number(id) === 1) {
            const targetFifo = await prisma.fifo.findUnique({
                where: {
                    id: Number(id),
                },
            });

            if (!targetFifo) {
                return res.status(404).json({
                    error: 'FIFO Id Not Found',
                });
            }
    
            return res.status(200).json({
                data: targetFifo,
            });
        }

        const targetFifo = await prisma.fifo.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                orderedItems: {
                    where: {
                        orderId: {
                            not: null
                        }
                    }
                }
            }
        });

        if (!targetFifo) {
            return res.status(404).json({
                error: 'FIFO Id Not Found',
            });
        }

        return res.status(200).json({
            data: targetFifo,
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}