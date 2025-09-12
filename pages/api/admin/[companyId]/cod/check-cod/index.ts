import { ORDER_STATUS } from "@/app/utils/enum";
import prisma from "@/client";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { PaymentStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    orderIds: number[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const { orderIds }: IBody = req.body;

        const orderList = await prisma.orders.findMany({
            where: {
                id: {
                    in: orderIds,
                },
            },
        });
        
        if (orderList.length === 0 || orderList.length !== orderIds.length) {
            return res.status(400).json({ error: 'Something went wrong with the orders' });
        }

        // Update the orders with the isCODCheck flag
        await prisma.orders.updateMany({
            where: {
                id: {
                    in: orderIds,
                },
            },
            data: {
                isCODCheck: true,
                paymentStatus: PaymentStatus.Paid,
                status: ORDER_STATUS.DELIVERED,
            },
        });

        return res.status(200).json({ message: 'Orders Checked Successfully' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);