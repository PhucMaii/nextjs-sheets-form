import { ORDER_STATUS } from "@/app/utils/enum";
import emailHandler from "@/pages/api/utils/email";
import { rejectOrderTemplate } from "@/config/email";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { order, reason, note } = req.body;

        if (!order || !reason || !note) {
            return res.status(400).json({
                error: 'Order, reason, and note are required',
            });
        }
        
        const updatedOrder = await prisma.orders.update({
            where: {
                id: order.id,
            },
            data: {
                status: ORDER_STATUS.VOID,
            },
            include: {
                user: true,
                items: {
                    include: {
                        inventoryItem: true,
                        inventoryUnit: true,
                    },
                },
            },
        });

        const template = rejectOrderTemplate(reason, updatedOrder, note);

        await emailHandler(order.user.email, 'Order Rejected', 'Order Rejected', template);

        return res.status(200).json({
            message: 'Order rejected successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }   
}

export default withAdminAuthGuard(handler);