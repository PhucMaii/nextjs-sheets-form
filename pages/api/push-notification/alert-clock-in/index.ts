import { NextApiRequest, NextApiResponse } from "next";
import webpush from "web-push";

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
        const 
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}