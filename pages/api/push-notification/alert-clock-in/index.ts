import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";
import { convertDeliveryDateStringToDate, getTodayDate } from "../../utils/date";
import { days } from "@/app/lib/constant";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const vapidKeys = {
            publicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
            privateKey: process.env.SECRET_VAPID_KEY!,
        }

        webpush.setVapidDetails(
            'mailto:maithienphuc0102@gmail.com',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );

        // Check if this is driver
        const drivers: any = await prisma.driver.findMany({
            where: {
                notification: {},
            },
            include: {
                routes: true,
            },
        });

        const today = getTodayDate();

        const date = convertDeliveryDateStringToDate(today.date);
        const day = days[date.getDay()];
        for (const driver of drivers) {
            const currentRoute = driver.routes.find((route: any) => {
                return route.day === day;
            });

            if (!currentRoute) {
                continue;
            }

            const subscription = JSON.parse(driver.notification);

            console.log(subscription);

            if (!subscription) {
                continue;
            }
            webpush.sendNotification(subscription, JSON.stringify({
                message: 'Good morning ' + driver.name + ', you have a shift today at ' + currentRoute.name,
                body: 'Do not forget to clock in your shift',
            }));
        }

        return res.status(200).json({ message: 'Push Notification Successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default handler;