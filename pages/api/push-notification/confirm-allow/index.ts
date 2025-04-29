import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import webpush from 'web-push';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const vapidKeys = {
      publicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
      privateKey: process.env.SECRET_VAPID_KEY!,
    };

    webpush.setVapidDetails(
      'mailto:maithienphuc0102@gmail.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    );

    const driver: any = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(400).json({ error: 'Driver not found' });
    }

    const subscription = JSON.parse(driver.notification);
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        message: 'Hi ' + driver.name,
        body: 'This is the confirmation of your allow notification',
      }),
    );

    return res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error confirming allow:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
