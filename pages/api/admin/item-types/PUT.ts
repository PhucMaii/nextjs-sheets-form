import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    name: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id, name }: IBody = req.body;

        const existingItemType = await prisma.itemType.findUnique({
            where: {
                id,
            },
        });

        if (!existingItemType) {
            return res.status(404).json({
                error: 'Item Type Not Found',
            });
        }

        const isNameExisted = await prisma.itemType.findFirst({
            where: {
                name,
                id: {
                    not: id,
                }
            },
        });

        if (isNameExisted) {
            return res.status(400).json({
                error: 'Item Type Name Existed',
            });
        }

        const updatedItemType = await prisma.itemType.update({
            where: {
                id,
            },
            data: {
                name,
            },
        });

        return res.status(200).json({
            data: updatedItemType,
            message: 'Update Item Type Successfully',
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}