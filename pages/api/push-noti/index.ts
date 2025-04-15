import { PrismaClient } from "@prisma/client";

import { NextApiRequest, NextApiResponse } from "next";
import webPush from 'web-push';
import { getDriverInfo } from "../utils/auth";

// const  prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const driver: any = await getDriverInfo(req, res);

        if (!driver) {
            return res.status(404).json({ error: 'Driver Not Found' });
        }

        await webPush.sendNotification(driver.notification, JSON.stringify({
            title: 'Hello',
            body: 'This is a push notification'
        }))
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}