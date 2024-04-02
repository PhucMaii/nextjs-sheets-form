import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();
        const updatedData = req.body as any;
        const { id, quantity, price} = updatedData;

        const data = await prisma.orderedItems.update({
            where: {
                id
            },
            data: {
                quantity,
                price
            } 
        });

        return res.status(200).json({
            data,
            message: 'Update Data Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
    }
}