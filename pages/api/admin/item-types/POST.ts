import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { name } = req.body;

        const prisma = new PrismaClient();

        const isNameExisted = await prisma.itemType.findFirst({
            where: {
                name,
            },
        });

        if (isNameExisted) {
            return res.status(400).json({
                error: 'Item Type Name Existed',
            });
        }

        const newItemType = await prisma.itemType.create({
            data: {
                name,
            },
        });

        return res.status(200).json({data: newItemType, message: 'Create New Item Type Successfully'});
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }

}