import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getTodayDate } from "../../utils/date";
import { ACTION, USER_ROLE } from "@/app/utils/enum";
import { YYYYMMDDFormat } from "@/app/utils/time";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader, 'AUTH HEADER');


    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const prisma = new PrismaClient();

        const { date, time } = getTodayDate();

        // Check if action has taken yet
        const action = await prisma.action.findFirst({
            where: {
                name: ACTION.CANCEL_AFFECT_INVENTORY,
                date: date,
            }
        });

        if (action && action.name === ACTION.CANCEL_AFFECT_INVENTORY) {
            return res.status(200).json({
                message: 'Action already taken',
            });
        }

        const today = new Date(date);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 3);

        const threeDaysAgoString = YYYYMMDDFormat(threeDaysAgo);

        console.log(threeDaysAgoString);
        // Set orders on that day no affect inventory
        await prisma.orders.updateMany({
            where: {
                deliveryDate: threeDaysAgoString,
            },
            data: {
                isAffectInventory: false,
            },
        });

        await prisma.action.create({
            data: {
                name: ACTION.CANCEL_AFFECT_INVENTORY,
                date: date,
                createdAt: time,
                createdBy: USER_ROLE.SYSTEM,
            },
        });

        return res.status(200).json({
            message: 'Disable affect inventory successfully for date: ' + date,
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}

export default handler;