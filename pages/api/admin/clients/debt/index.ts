import { ORDER_STATUS } from "@/app/utils/enum";
import { Orders, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface QueryTypes {
    userId?: string;
    endMonth?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({
                error: 'Your method is not supported'
            })
        }
        const prisma = new PrismaClient();

        const { userId, endMonth }: QueryTypes = req.query;

        const incompletedOrders = await prisma.orders.findMany({
            where: {
                userId: Number(userId),
                status: {
                    in: [ORDER_STATUS.INCOMPLETED, ORDER_STATUS.DELIVERED]
                }
            }
        });

        if (incompletedOrders.length === 0) {
            return res.status(200).json({
                data: [],
                message: 'User Has No Debt'
            })
        }

        // Group order by mm/yyyy
        const debtOrdersByMonth = incompletedOrders.reduce((acc: any, order: Orders) => {
            const splitDeliveryDate = order.deliveryDate.split('/');
            console.log({month: splitDeliveryDate[0], endMonth})
            if (Number(splitDeliveryDate[0]) > Number(endMonth)) {
                return acc;
            }
            // key is mm/yyyy
            const key = `${splitDeliveryDate[0]}/${splitDeliveryDate[2]}`;

            if (!acc[key]) {
                acc[key] = 0;
            }

            acc[key] = acc[key] + order.totalPrice;
            return acc;
        }, {});

        return res.status(200).json({
            data: debtOrdersByMonth,
            message: 'Fetch Debt Data Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error 
        })
    }
}