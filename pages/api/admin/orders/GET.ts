import { YYYYMMDDFormat } from "@/app/utils/time";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();
        const currentDate = new Date();
        const formattedDate = YYYYMMDDFormat(currentDate);
        
        const orders = await prisma.orders.findMany({
            where: {
                date: formattedDate
            }
        })

        if (!orders || orders.length === 0) {
            return res.status(400).json({
                error: 'There is not orders at the momment'
            })
        }
        

        console.log(orders, 'orders');
        return res.status(200).json({
            message: 'Fetch all orders successfully',
            data: orders
        })
    } catch (error: any) {
        console.log('Fail to get order: ', error);
        return res.status(500).json({
            error: 'Fail to get orders: ' + error
        })
    }
}