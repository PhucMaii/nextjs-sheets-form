import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    categoryId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { categoryId }: IQuery = req.query;

        if (!categoryId) {
            return res.status(404).json({
                error: 'Category id is missing'
            });
        }

        const items = await prisma.item.findMany({
            where: {
                categoryId: Number(categoryId)
            },
            include: {
                subCategory: true
            }
        });

        return res.status(200).json({
            data: items,
            message: 'Fetch Items Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}