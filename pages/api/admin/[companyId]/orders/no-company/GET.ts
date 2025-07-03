import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/client';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const orders = await prisma.orders.findMany({
            where: {
                companyId: null,
            },
        });
        
        return res.status(200).json({
            data: orders,
            message: 'No company orders fetched successfully',
        });
    } catch (error: any) {
        console.error('Internal Server Error: ', error);
        res.status(500).json({ error: error.message });
    }
}