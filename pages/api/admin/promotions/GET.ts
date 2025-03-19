import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    id?: string
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id }: IQuery = req.query;

        if (id) {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    items: true
                }
            });
    
            if (!promotion) {
                return res.status(404).json({
                    error: 'Promotion Not Found',
                });
            }
            
            return res.status(200).json({
                data: promotion,
                message: 'Fetch Promotion Successfully',
            });
        }

        const allPromotions = await prisma.promotion.findMany({
            include: {
                items: true
            }
        });

        console.log(allPromotions, 'allPromotions');

        return res.status(200).json({
            data: allPromotions,
            message: 'Fetch All Promotions Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}