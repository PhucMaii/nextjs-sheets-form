import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    name: string;
    price: number;
    unitId: number;
    itemId: number;
    selectedCategoryIds: number[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();
        const { name, price, unitId, itemId, selectedCategoryIds }: IBody = req.body;

        // Check is unitId existed in itemId
        const sameUnitOption = await prisma.option.findFirst({
            where: {
                unitId,
                itemId,
            },
        });

        if (sameUnitOption) {
            return res.status(500).json({
                error: 'Option Name Existed',
            });
        }

        const newOption = await prisma.option.create({
            data: {
                name,
                price,
                availability: true,
                unitId,
                itemId,
            },
        });

        return res.status(201).json({
            data: newOption,
            message: 'Create New Option Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}