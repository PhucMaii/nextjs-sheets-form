import { Item, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    categoryId: number;
    newItems: Item[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const prisma = new PrismaClient();

        const { categoryId, newItems }: IBody = req.body;
        
        const existingCategory = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        })

        if (!existingCategory) {
            return res.status(404).json({
                error: 'Category Id Not Found',
            });
        }

        // Delete old items from category
        await prisma.item.deleteMany({
            where: {
                categoryId: categoryId,
            },
        });

        const formattedNewItems = newItems.map((item: Item) => {
            return {
                name: item.name,
                price: item.price,
                categoryId: categoryId,
                availability: item?.availability,
            };
        });

        // Create new items
        await prisma.item.createMany({
            data: formattedNewItems,
        });

        return res.status(200).json({
            message: 'Items Pasted Succesfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
} 