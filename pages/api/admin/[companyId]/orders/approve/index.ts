import { ORDER_STATUS } from "@/app/utils/enum";
import prisma from "@/client";
import { approveOrderTemplate } from "@/config/email";
import emailHandler from "@/pages/api/utils/email";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { order, deliveryDate, deliveryTime } = req.body;

        if (!order || !deliveryDate || !deliveryTime) {
            return res.status(400).json({
                error: 'Order ID, delivery date, and delivery time are required',
            });
        }

        const updatedOrder = await prisma.orders.update({
            where: {
                id: order.id,
            },
            data: {
                deliveryDate: deliveryDate,
                status: ORDER_STATUS.INCOMPLETED,
            },
            include: {
                user: true,
                items: {
                    include: {
                        inventoryItem: true,
                        inventoryUnit: true,
                    }
                },
            },
        });

        const template = approveOrderTemplate(deliveryDate, deliveryTime, updatedOrder);

        await emailHandler(order.user.email, 'Order Approved', 'Order Approved', template);

        return res.status(200).json({
            message: 'Order approved successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}

export default withAdminAuthGuard(handler);