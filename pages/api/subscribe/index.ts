import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getDriverInfo } from "../utils/auth";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const { subscription } = req.body;

        const driver: any = await getDriverInfo(req, res);

        await prisma.driver.update({
            where: {
                id: driver.id,
            },
            data: {
                notification: subscription
            }
        });

        return res.status(200).json({
            message: 'Subscribe Successfully',
        });

    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default handler;