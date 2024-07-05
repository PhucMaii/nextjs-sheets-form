import { ORDER_STATUS } from "@/app/utils/enum";
import { OrderedItems, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    orderId: number;
    updatedStatus: ORDER_STATUS;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { orderId, updatedStatus }: IBody = req.body;

        const existingOrder = await prisma.orders.findUnique({
            where: {
                id: orderId
            }
        });

        if (!existingOrder) {
            return res.status(404).json({
                error: 'Order Id Not Found'
            })
        }

        const updatedOrder = await prisma.orders.update({
            where: {
                id: existingOrder.id
            },
            data: {
                status: updatedStatus
            },
            include: {
                user: {
                    include: {
                        preference: true,
                        category: true
                    }
                },
                items: true,
            },
        });

        const newItems = updatedOrder.items.map((item: OrderedItems) => {
            const totalPrice = item.quantity * item.price;
            return {...item, totalPrice}
        });
        
        return res.status(200).json({
            data:  {...updatedOrder.user, ...updatedOrder, items: newItems},
            message: 'Order Status Updated Successfully'
        })

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}