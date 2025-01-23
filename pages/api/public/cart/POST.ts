import { IItemPreference } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    items: IItemPreference[];
    userId?: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { items, userId }: IBody = req.body;

        if (userId) {
            const userExistingCart = await prisma.cart.findFirst({
                where: {
                    userId
                }
            });

            if (userExistingCart) {
                return res.status(400).json({
                    error: 'Your cart already existed'
                });
            }
        }

        const newCart = await prisma.cart.create({
            
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}