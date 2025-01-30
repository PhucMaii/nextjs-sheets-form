import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    itemId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'DELETE') {
            return res.status(200).json({
                error: 'Your method is not supported'
            });
        }

        const prisma = new PrismaClient();

        const { itemId }: IQuery = req.query;

        if (!itemId) {
            return res.status(404).json({
                error: 'Item Id Is Missing'
            });
        }

        const existingCartItem = await prisma.cartItem.findUnique({
            where: {
                id: Number(itemId)
            }
        });

        if (!existingCartItem) {
            return res.status(404).json({
                error: 'Item Not Found'
            })
        }

        await prisma.cartItem.delete({
            where: {
                id: Number(itemId)
            }
        });

        return res.status(200).json({
            message: 'Item Removed Successfully'
        })

        
    } catch (error: any) {
        console.log('Internal Server Error: ' + error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}